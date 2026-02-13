/**
 * Pipeline engine — browser-side port of server.ts orchestration logic.
 *
 * All pipeline processing runs in-browser using the maligna-ts library directly.
 * Example files are fetched as static assets from /examples/.
 */

import {
  Alignment,
  BEST_CATEGORY_MAP,
  MOORE_CATEGORY_MAP,
  AlParser,
  PlaintextParser,
  AlFormatter,
  TmxFormatter,
  PresentationFormatter,
  HtmlFormatter,
  InfoFormatter,
  Aligner,
  UnifyAligner,
  ViterbiAlgorithm,
  ViterbiData,
  ForwardBackwardAlgorithm,
  AdaptiveBandAlgorithm,
  ViterbiAlgorithmFactory,
  ForwardBackwardAlgorithmFactory,
  OneToOneAlgorithm,
  Modifier,
  NullModifyAlgorithm,
  WordSplitAlgorithm,
  SentenceSplitAlgorithm,
  ParagraphSplitAlgorithm,
  TrimCleanAlgorithm,
  LowercaseCleanAlgorithm,
  FilterNonWordsCleanAlgorithm,
  UnifyRareWordsCleanAlgorithm,
  SeparatorMergeAlgorithm,
  OneToOneSelector,
  FractionSelector,
  ProbabilitySelector,
  IntersectionSelector,
  DifferenceSelector,
  decorateFilter,
  GaleAndChurchMacro,
  PoissonMacro,
  MooreMacro,
  TranslationMacro,
  PoissonTranslationMacro,
  NormalDistributionCalculator,
  PoissonDistributionCalculator,
  TranslationCalculator,
  OracleCalculator,
  CharCounter,
  SplitCounter,
  CompositeCalculator,
  MinimumCalculator,
  FullMatrixFactory,
  BandMatrixFactory,
  Vocabulary,
  DEFAULT_TOKENIZE_ALGORITHM,
  DEFAULT_MAX_WORD_COUNT,
  DEFAULT_MIN_OCCURRENCE_COUNT,
  tokenize,
  createTruncatedVocabulary,
  trainLanguageModel,
  parseLanguageModel,
  DEFAULT_TRAIN_ITERATION_COUNT,
  trainTranslationModel,
  parseTranslationModel,
  compare,
  round,
} from 'maligna-ts';

import type {
  Filter,
  Calculator,
  TranslationModel,
  AlignAlgorithm,
  ModifyAlgorithm,
  Counter,
} from 'maligna-ts';

import type { ExampleInfo } from './state';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PipelineStep {
  type: 'modify' | 'align' | 'select' | 'macro';
  config: Record<string, any>;
}

export interface PipelineInput {
  type: 'example' | 'custom' | 'al';
  name?: string;
  sourceText?: string;
  targetText?: string;
  sourceLang?: string;
  targetLang?: string;
  alContent?: string;
}

export interface PipelineFormat {
  class: string;
  width?: number;
  sourceLang?: string;
  targetLang?: string;
}

export interface PipelineRequest {
  input: PipelineInput;
  steps: PipelineStep[];
  format: PipelineFormat;
}

export interface PipelineResult {
  formatted: Record<string, string>;
  alignmentCount: number;
  alignmentData: Array<{
    sourceSegments: string[];
    targetSegments: string[];
    score: number;
    category: string;
  }>;
}

export interface StepProgress {
  name: string;
  index: number;
  total: number;
  alignmentCount?: number;
  elapsed?: number;
  infoText?: string;
  done?: boolean;
}

export type ProgressCallback = (progress: StepProgress) => void;

// ─── Example fetching ──────────────────────────────────────────────────────────

const textCache = new Map<string, string>();

function fromExamples(path: string): string {
  return `${import.meta.env.BASE_URL}examples/${path}`;
}

async function fetchText(url: string): Promise<string> {
  const cached = textCache.get(url);
  if (cached !== undefined) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  textCache.set(url, text);
  return text;
}

// ─── Input parsing ─────────────────────────────────────────────────────────────

export async function parseInput(
  input: PipelineInput,
  examples: ExampleInfo[],
): Promise<Alignment[]> {
  if (input.type === 'example') {
    const example = examples.find(e => e.name === input.name);
    if (!example) throw new Error(`Example not found: ${input.name}`);
    const sourceText = await fetchText(fromExamples(`txt/${example.sourceFile}`));
    const targetText = await fetchText(fromExamples(`txt/${example.targetFile}`));
    return new PlaintextParser(sourceText, targetText).parse();
  } else if (input.type === 'custom') {
    if (!input.sourceText || !input.targetText) {
      throw new Error('Source and target text required for custom input');
    }
    return new PlaintextParser(input.sourceText, input.targetText).parse();
  } else if (input.type === 'al') {
    if (!input.alContent) throw new Error('AL content required');
    return new AlParser(input.alContent).parse();
  }
  throw new Error(`Unknown input type: ${input.type}`);
}

// ─── Modify algorithm factory ──────────────────────────────────────────────────

function createModifyAlgorithm(
  cls: string,
  config: Record<string, any>,
  alignmentList: Alignment[],
): { source: ModifyAlgorithm; target: ModifyAlgorithm } {
  let sourceAlgorithm: ModifyAlgorithm;
  let targetAlgorithm: ModifyAlgorithm | null = null;

  switch (cls) {
    case 'split-word':
      sourceAlgorithm = new WordSplitAlgorithm();
      break;
    case 'split-sentence':
      sourceAlgorithm = new SentenceSplitAlgorithm();
      break;
    case 'split-paragraph':
      sourceAlgorithm = new ParagraphSplitAlgorithm();
      break;
    case 'merge': {
      let separator = config.separator || '';
      separator = separator.replace(/\\t/g, '\t').replace(/\\n/g, '\n');
      sourceAlgorithm = new SeparatorMergeAlgorithm(separator);
      break;
    }
    case 'trim':
      sourceAlgorithm = new TrimCleanAlgorithm();
      break;
    case 'lowercase':
      sourceAlgorithm = new LowercaseCleanAlgorithm();
      break;
    case 'filter-non-words':
      sourceAlgorithm = new FilterNonWordsCleanAlgorithm();
      break;
    case 'unify-rare-words': {
      const maxWordCount = config.maxWordCount ?? DEFAULT_MAX_WORD_COUNT;
      const minOccurrenceCount = config.minOccurrenceCount ?? DEFAULT_MIN_OCCURRENCE_COUNT;

      const sourceVocabulary = new Vocabulary();
      const targetVocabulary = new Vocabulary();
      const sourceWidList: number[][] = [];
      const targetWidList: number[][] = [];

      tokenize(
        DEFAULT_TOKENIZE_ALGORITHM,
        alignmentList,
        sourceVocabulary,
        targetVocabulary,
        sourceWidList,
        targetWidList,
      );

      const truncatedSourceVocab = createTruncatedVocabulary(
        sourceWidList, sourceVocabulary, maxWordCount, minOccurrenceCount,
      );
      const truncatedTargetVocab = createTruncatedVocabulary(
        targetWidList, targetVocabulary, maxWordCount, minOccurrenceCount,
      );

      sourceAlgorithm = new UnifyRareWordsCleanAlgorithm(truncatedSourceVocab);
      targetAlgorithm = new UnifyRareWordsCleanAlgorithm(truncatedTargetVocab);
      break;
    }
    default:
      throw new Error(`Unknown modifier class: ${cls}`);
  }

  const part = config.part || 'both';
  if (part === 'both') {
    if (targetAlgorithm === null) targetAlgorithm = sourceAlgorithm;
  } else if (part === 'source') {
    targetAlgorithm = new NullModifyAlgorithm();
  } else if (part === 'target') {
    targetAlgorithm = sourceAlgorithm;
    sourceAlgorithm = new NullModifyAlgorithm();
  }

  return { source: sourceAlgorithm, target: targetAlgorithm! };
}

// ─── Calculator factory ────────────────────────────────────────────────────────

function createCounter(counterName: string): Counter {
  if (counterName === 'char') return new CharCounter();
  if (counterName === 'word') return new SplitCounter();
  throw new Error(`Unknown counter: ${counterName}`);
}

function buildCalculator(config: Record<string, any>, alignmentList: Alignment[]): Calculator {
  const calculatorNames: string[] = Array.isArray(config.calculators)
    ? config.calculators
    : [config.calculators];
  const calculators: Calculator[] = [];

  for (let i = 0; i < calculatorNames.length; i++) {
    const name = calculatorNames[i];
    switch (name) {
      case 'normal': {
        const counter = createCounter(config.counter || 'char');
        calculators.push(new NormalDistributionCalculator(counter));
        break;
      }
      case 'poisson': {
        const counter = createCounter(config.counter || 'word');
        let lengthAlignmentList = alignmentList;
        if (config.lengthCorpusContent) {
          lengthAlignmentList = new AlParser(config.lengthCorpusContent).parse();
        }
        calculators.push(new PoissonDistributionCalculator(counter, lengthAlignmentList));
        break;
      }
      case 'translation': {
        calculators.push(createTranslationCalculator(config));
        break;
      }
      case 'oracle': {
        if (!config.oracleContent) throw new Error('Oracle reference content required');
        const oracleAlignmentList = new AlParser(config.oracleContent).parse();
        const oracleCalc = new OracleCalculator(oracleAlignmentList);
        const remaining = calculatorNames.slice(i + 1);
        if (remaining.length > 0) {
          const remainingConfig = { ...config, calculators: remaining };
          const remainingCalc = buildCalculator(remainingConfig, alignmentList);
          calculators.push(
            new MinimumCalculator(oracleCalc, remainingCalc, OracleCalculator.DEFAULT_SUCCESS_SCORE),
          );
        } else {
          calculators.push(oracleCalc);
        }
        return calculators.length === 1 ? calculators[0] : new CompositeCalculator(calculators);
      }
      default:
        throw new Error(`Unknown calculator: ${name}`);
    }
  }

  return calculators.length === 1 ? calculators[0] : new CompositeCalculator(calculators);
}

function createTranslationCalculator(config: Record<string, any>): Calculator {
  const iterations = config.iterations ?? DEFAULT_TRAIN_ITERATION_COUNT;

  const sourceVocabulary = new Vocabulary();
  const targetVocabulary = new Vocabulary();
  const sourceWidList: number[][] = [];
  const targetWidList: number[][] = [];

  if (config.translationCorpusContent) {
    const translationAlignmentList = new AlParser(config.translationCorpusContent).parse();
    tokenize(
      DEFAULT_TOKENIZE_ALGORITHM,
      translationAlignmentList,
      sourceVocabulary,
      targetVocabulary,
      sourceWidList,
      targetWidList,
    );
  }

  let sourceLanguageModel;
  let targetLanguageModel;

  if (config.sourceLanguageModelContent && config.targetLanguageModelContent) {
    sourceLanguageModel = parseLanguageModel(config.sourceLanguageModelContent);
    targetLanguageModel = parseLanguageModel(config.targetLanguageModelContent);
  } else {
    sourceLanguageModel = trainLanguageModel(sourceWidList);
    targetLanguageModel = trainLanguageModel(targetWidList);
  }

  let translationModel: TranslationModel;
  if (config.translationModelContent) {
    translationModel = parseTranslationModel(
      config.translationModelContent, sourceVocabulary, targetVocabulary,
    );
  } else {
    translationModel = trainTranslationModel(iterations, sourceWidList, targetWidList);
  }

  return new TranslationCalculator(
    sourceVocabulary,
    targetVocabulary,
    sourceLanguageModel,
    targetLanguageModel,
    translationModel,
    DEFAULT_TOKENIZE_ALGORITHM,
  );
}

// ─── Align algorithm factory ───────────────────────────────────────────────────

function createAlignAlgorithm(
  config: Record<string, any>,
  alignmentList: Alignment[],
): AlignAlgorithm {
  const cls = config.class;
  const categoryMapName = config.categoryMap || 'best';
  const categoryMap = categoryMapName === 'moore' ? MOORE_CATEGORY_MAP : BEST_CATEGORY_MAP;

  if (cls === 'viterbi' || cls === 'fb') {
    const calculator = buildCalculator(config, alignmentList);
    const search = config.search || 'iterative-band';

    if (search === 'exhaustive') {
      if (cls === 'viterbi') {
        const matrixFactory = new FullMatrixFactory<ViterbiData>();
        return new ViterbiAlgorithm(calculator, categoryMap, matrixFactory);
      } else {
        const matrixFactory = new FullMatrixFactory<number>();
        return new ForwardBackwardAlgorithm(calculator, categoryMap, matrixFactory);
      }
    } else if (search === 'band') {
      const radius = config.radius ?? BandMatrixFactory.DEFAULT_BAND_RADIUS;
      if (cls === 'viterbi') {
        const matrixFactory = new BandMatrixFactory<ViterbiData>(radius);
        return new ViterbiAlgorithm(calculator, categoryMap, matrixFactory);
      } else {
        const matrixFactory = new BandMatrixFactory<number>(radius);
        return new ForwardBackwardAlgorithm(calculator, categoryMap, matrixFactory);
      }
    } else if (search === 'iterative-band') {
      const radius = config.radius ?? AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS;
      const increment = config.increment ?? AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO;
      const margin = config.margin ?? AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN;
      const algorithmFactory = cls === 'viterbi'
        ? new ViterbiAlgorithmFactory()
        : new ForwardBackwardAlgorithmFactory();
      return new AdaptiveBandAlgorithm(
        algorithmFactory, calculator, radius, increment, margin, categoryMap,
      );
    }
    throw new Error(`Unknown search method: ${search}`);
  } else if (cls === 'one-to-one') {
    return new OneToOneAlgorithm(config.strict || false);
  }
  throw new Error(`Unknown algorithm class: ${cls}`);
}

// ─── Step execution ────────────────────────────────────────────────────────────

function applyStep(step: PipelineStep, alignmentList: Alignment[]): Alignment[] {
  switch (step.type) {
    case 'modify': {
      const algorithms = createModifyAlgorithm(step.config.class, step.config, alignmentList);
      let filter: Filter = new Modifier(algorithms.source, algorithms.target);
      filter = decorateFilter(filter);
      return filter.apply(alignmentList);
    }
    case 'align': {
      const cls = step.config.class;
      let filter: Filter;
      if (cls === 'unify') {
        if (!step.config.unificationContent) {
          throw new Error('Unification reference content required');
        }
        const refAlignments = new AlParser(step.config.unificationContent).parse();
        filter = new UnifyAligner(refAlignments);
      } else {
        const algorithm = createAlignAlgorithm(step.config, alignmentList);
        filter = new Aligner(algorithm);
      }
      filter = decorateFilter(filter);
      return filter.apply(alignmentList);
    }
    case 'select': {
      const cls = step.config.class;
      let filter: Filter;
      switch (cls) {
        case 'one-to-one':
          filter = new OneToOneSelector();
          break;
        case 'fraction':
          filter = new FractionSelector(step.config.fraction ?? 0.5);
          break;
        case 'probability':
          filter = new ProbabilitySelector(step.config.probability ?? 0.5);
          break;
        case 'intersection': {
          if (!step.config.referenceContent) {
            throw new Error('Reference content required for intersection');
          }
          const ref = new AlParser(step.config.referenceContent).parse();
          filter = new IntersectionSelector(ref);
          break;
        }
        case 'difference': {
          if (!step.config.referenceContent) {
            throw new Error('Reference content required for difference');
          }
          const ref = new AlParser(step.config.referenceContent).parse();
          filter = new DifferenceSelector(ref);
          break;
        }
        default:
          throw new Error(`Unknown selector class: ${cls}`);
      }
      filter = decorateFilter(filter);
      return filter.apply(alignmentList);
    }
    case 'macro': {
      const cls = step.config.class;
      let filter: Filter;
      switch (cls) {
        case 'galechurch': filter = new GaleAndChurchMacro(); break;
        case 'poisson': filter = new PoissonMacro(); break;
        case 'moore': filter = new MooreMacro(); break;
        case 'translation': filter = new TranslationMacro(); break;
        case 'poisson-translation': filter = new PoissonTranslationMacro(); break;
        default: throw new Error(`Unknown macro class: ${cls}`);
      }
      filter = decorateFilter(filter);
      return filter.apply(alignmentList);
    }
    default:
      throw new Error(`Unknown step type: ${(step as any).type}`);
  }
}

// ─── Formatting ────────────────────────────────────────────────────────────────

export function formatAlignments(
  alignmentList: Alignment[],
  format: PipelineFormat,
): Record<string, string> {
  const results: Record<string, string> = {};

  results.al = new AlFormatter().format(alignmentList);
  results.info = new InfoFormatter().format(alignmentList);

  switch (format.class) {
    case 'presentation':
      results.presentation = new PresentationFormatter(format.width ?? 79).format(alignmentList);
      break;
    case 'html':
      results.html = new HtmlFormatter().format(alignmentList);
      break;
    case 'tmx': {
      const sl = format.sourceLang || 'source';
      const tl = format.targetLang || 'target';
      results.tmx = new TmxFormatter(sl, tl).format(alignmentList);
      break;
    }
    case 'al':
    default:
      break;
  }

  return results;
}

// ─── Pipeline runner ───────────────────────────────────────────────────────────

/**
 * Yield to the browser between pipeline steps so the UI can repaint.
 */
function yieldToUI(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export async function runPipeline(
  request: PipelineRequest,
  examples: ExampleInfo[],
  onProgress?: ProgressCallback,
): Promise<PipelineResult> {
  const totalSteps = request.steps.length + 2; // parse + steps + format

  // Step 1: Parse input
  onProgress?.({ name: 'Parsing input', index: 0, total: totalSteps });
  let alignmentList = await parseInput(request.input, examples);
  onProgress?.({ name: 'Input parsed', index: 0, total: totalSteps, alignmentCount: alignmentList.length, done: true });
  await yieldToUI();

  // Step 2: Apply pipeline steps
  for (let i = 0; i < request.steps.length; i++) {
    const step = request.steps[i];
    const stepLabel = `${step.type}: ${step.config.class}`;
    onProgress?.({ name: stepLabel, index: i + 1, total: totalSteps });
    const startTime = Date.now();
    alignmentList = applyStep(step, alignmentList);
    const elapsed = Date.now() - startTime;
    onProgress?.({
      name: stepLabel,
      index: i + 1,
      total: totalSteps,
      alignmentCount: alignmentList.length,
      elapsed,
      done: true,
    });
    await yieldToUI();
  }

  // Step 3: Format results
  onProgress?.({ name: 'Formatting results', index: totalSteps - 1, total: totalSteps });
  const formatted = formatAlignments(alignmentList, request.format);
  onProgress?.({
    name: 'Formatting results',
    index: totalSteps - 1,
    total: totalSteps,
    alignmentCount: alignmentList.length,
    infoText: formatted.info || '',
    done: true,
  });

  const alignmentData = alignmentList.map(a => ({
    sourceSegments: a.sourceSegmentList,
    targetSegments: a.targetSegmentList,
    score: a.score,
    category: a.getCategory().toKey(),
  }));

  return { formatted, alignmentCount: alignmentList.length, alignmentData };
}

// ─── Compare ───────────────────────────────────────────────────────────────────

export interface CompareResult {
  precision: number;
  recall: number;
  commonCount: number;
  leftCount: number;
  rightCount: number;
  diffGroupCount: number;
  diffFormatted: string;
}

export function compareAlignments(
  leftContent: string,
  rightContent: string,
  width?: number,
): CompareResult {
  const leftAlignments = new AlParser(leftContent).parse();
  const rightAlignments = new AlParser(rightContent).parse();
  const diff = compare(leftAlignments, rightAlignments);

  const commonCount = diff.commonList.length;
  const precision = round(commonCount / rightAlignments.length, 4);
  const recall = round(commonCount / leftAlignments.length, 4);

  let diffFormatted = '';
  if (width) {
    const formatter = new PresentationFormatter(width);
    for (let i = 0; i < diff.leftGroupList.length; i++) {
      diffFormatted += '< left alignments\n\n';
      diffFormatted += formatter.format(diff.leftGroupList[i]);
      diffFormatted += '\n\n> right alignments\n\n';
      diffFormatted += formatter.format(diff.rightGroupList[i]);
      diffFormatted += '\n\n---\n\n';
    }
  }

  return {
    precision,
    recall,
    commonCount,
    leftCount: leftAlignments.length,
    rightCount: rightAlignments.length,
    diffGroupCount: diff.leftGroupList.length,
    diffFormatted,
  };
}

// ─── Re-format ─────────────────────────────────────────────────────────────────

export function reformatAlignments(
  alContent: string,
  format: PipelineFormat,
): { formatted: Record<string, string>; alignmentCount: number } {
  const alignmentList = new AlParser(alContent).parse();
  const formatted = formatAlignments(alignmentList, format);
  return { formatted, alignmentCount: alignmentList.length };
}

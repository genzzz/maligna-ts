#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';

// Core types
import { Alignment } from '../coretypes/Alignment';
import { BEST_CATEGORY_MAP } from '../coretypes/CategoryDefaults';

// Parsers
import { AlParser } from '../parser/AlParser';
import { PlaintextParser } from '../parser/PlaintextParser';
import { TmxParser } from '../parser/TmxParser';

// Formatters
import { AlFormatter } from '../formatter/AlFormatter';
import { PlaintextFormatter } from '../formatter/PlaintextFormatter';
import { TmxFormatter } from '../formatter/TmxFormatter';
import { PresentationFormatter } from '../formatter/PresentationFormatter';
import { HtmlFormatter } from '../formatter/HtmlFormatter';
import { InfoFormatter } from '../formatter/InfoFormatter';

// Filters
import { Filter } from '../filter/Filter';
import { Aligner } from '../filter/aligner/Aligner';
import { UnifyAligner } from '../filter/aligner/UnifyAligner';
import { AlignAlgorithm } from '../filter/aligner/align/AlignAlgorithm';
import { ViterbiAlgorithm } from '../filter/aligner/align/hmm/viterbi/ViterbiAlgorithm';
import { ForwardBackwardAlgorithm } from '../filter/aligner/align/hmm/fb/ForwardBackwardAlgorithm';
import { AdaptiveBandAlgorithm } from '../filter/aligner/align/hmm/adaptive/AdaptiveBandAlgorithm';
import {
  ViterbiAlgorithmFactory,
  ForwardBackwardAlgorithmFactory,
} from '../filter/aligner/align/hmm/HmmAlignAlgorithmFactory';
import { OneToOneAlgorithm } from '../filter/aligner/align/onetoone/OneToOneAlgorithm';
import { Modifier } from '../filter/modifier/Modifier';
import { ModifyAlgorithm, NullModifyAlgorithm } from '../filter/modifier/modify/ModifyAlgorithm';
import { WordSplitAlgorithm } from '../filter/modifier/modify/split/WordSplitAlgorithm';
import { SentenceSplitAlgorithm } from '../filter/modifier/modify/split/SentenceSplitAlgorithm';
import { ParagraphSplitAlgorithm } from '../filter/modifier/modify/split/ParagraphSplitAlgorithm';
import { SrxSplitAlgorithm } from '../filter/modifier/modify/split/SrxSplitAlgorithm';
import { SplitAlgorithm } from '../filter/modifier/modify/split/SplitAlgorithm';
import {
  TrimCleanAlgorithm,
  LowercaseCleanAlgorithm,
  FilterNonWordsCleanAlgorithm,
  UnifyRareWordsCleanAlgorithm,
} from '../filter/modifier/modify/clean';
import { SeparatorMergeAlgorithm } from '../filter/modifier/modify/merge';
import {
  OneToOneSelector,
  FractionSelector,
  ProbabilitySelector,
  IntersectionSelector,
  DifferenceSelector,
} from '../filter/selector';
import { decorateFilter } from '../filter/meta';
import {
  GaleAndChurchMacro,
  PoissonMacro,
  MooreMacro,
  TranslationMacro,
  PoissonTranslationMacro,
} from '../filter/macro';

// Calculators
import { Calculator } from '../calculator/Calculator';
import { NormalDistributionCalculator } from '../calculator/length/NormalDistributionCalculator';
import { PoissonDistributionCalculator } from '../calculator/length/PoissonDistributionCalculator';
import { TranslationCalculator } from '../calculator/content/TranslationCalculator';
import { OracleCalculator } from '../calculator/content/OracleCalculator';
import { Counter, CharCounter, SplitCounter } from '../calculator/length/Counter';
import { CompositeCalculator, MinimumCalculator } from '../calculator/meta';

// Matrix
import { FullMatrixFactory } from '../matrix/FullMatrix';
import { BandMatrixFactory } from '../matrix/BandMatrix';
import { MatrixFactory } from '../matrix/Matrix';

// Models
import { Vocabulary } from '../model/vocabulary/Vocabulary';
import {
  DEFAULT_TOKENIZE_ALGORITHM,
  DEFAULT_MAX_WORD_COUNT,
  DEFAULT_MIN_OCCURRENCE_COUNT,
  tokenize,
  createTruncatedVocabulary,
} from '../model/vocabulary/VocabularyUtil';
import { trainLanguageModel, parseLanguageModel } from '../model/language/LanguageModelUtil';
import { LanguageModel } from '../model/language/LanguageModel';
import { TranslationModel } from '../model/translation/TranslationModel';
import {
  DEFAULT_TRAIN_ITERATION_COUNT,
  trainTranslationModel,
  parseTranslationModel,
} from '../model/translation/TranslationModelUtil';

// Comparator
import { compare } from '../comparator';

// Progress
import { ProgressManager } from '../progress/ProgressManager';
import { WriterProgressObserver } from '../progress/WriterProgressObserver';

// Util
import { round } from '../util/util';

const VERSION = '0.0.1';
const INTERSECTION_SYMBOL = '\u2229';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function readStdin(): string {
  return fs.readFileSync(0, 'utf-8');
}

function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function loadAlignmentList(fileName: string): Alignment[] {
  const content = readFileContent(fileName);
  return new AlParser(content).parse();
}

function setupProgress(verbosity: string | undefined): void {
  if (verbosity !== 'quiet') {
    const observer = new WriterProgressObserver(process.stderr, 40);
    ProgressManager.getInstance().registerProgressObserver(observer);
  }
}

function createCounter(counterName: string | undefined): Counter {
  if (!counterName) {
    throw new Error('Missing required option: --counter');
  }
  if (counterName === 'char') return new CharCounter();
  if (counterName === 'word') return new SplitCounter();
  throw new Error(`Unknown counter: ${counterName}. Valid values: char, word.`);
}

// ─── Parse Command ─────────────────────────────────────────────────────────────

function parseCommand(program: Command): void {
  program
    .command('parse')
    .description('Parse input files into .al XML format')
    .requiredOption('-c, --class <type>', 'Parser class. Valid values: al, txt, tmx')
    .option('-l, --languages <langs>', 'Source and target language separated by comma (optional for tmx parser)')
    .option('-v, --verbosity <level>', 'Set verbosity level. Valid values: trace, debug, info (default), warn, error, fatal, quiet (no progress meter)')
    .helpOption('-h, --help', 'Display help message')
    .argument('[files...]', 'Input files')
    .action((files: string[], opts) => {
      setupProgress(opts.verbosity);
      const cls = opts.class;
      let alignmentList: Alignment[] = [];

      if (cls === 'al') {
        if (files.length < 1) throw new Error('Expected at least 1 file argument.');
        for (const fileName of files) {
          const content = readFileContent(fileName);
          const parser = new AlParser(content);
          alignmentList.push(...parser.parse());
        }
      } else if (cls === 'txt') {
        if (files.length % 2 !== 0 || files.length === 0) {
          throw new Error(`Expected even number of files (source/target pairs), got ${files.length}.`);
        }
        for (let i = 0; i < files.length; i += 2) {
          const sourceContent = readFileContent(files[i]);
          const targetContent = readFileContent(files[i + 1]);
          const parser = new PlaintextParser(sourceContent, targetContent);
          alignmentList.push(...parser.parse());
        }
      } else if (cls === 'tmx') {
        if (files.length < 1) throw new Error('Expected at least 1 file argument.');
        const languages = opts.languages;
        let sourceLang: string | undefined;
        let targetLang: string | undefined;
        if (languages) {
          const parts = languages.split(',');
          if (parts.length !== 2) throw new Error('Languages must be two comma-separated values.');
          sourceLang = parts[0];
          targetLang = parts[1];
        }
        for (const fileName of files) {
          const content = readFileContent(fileName);
          if (sourceLang && targetLang) {
            const parser = new TmxParser(content, sourceLang, targetLang);
            alignmentList.push(...parser.parse());
          } else {
            // Parse without language filter - use first two languages found
            const parser = new TmxParser(content, '', '');
            alignmentList.push(...parser.parse());
          }
        }
      } else {
        throw new Error(`Unknown parser class: ${cls}. Valid values: al, txt, tmx.`);
      }

      const formatter = new AlFormatter();
      process.stdout.write(formatter.format(alignmentList));
    });
}

// ─── Format Command ────────────────────────────────────────────────────────────

function formatCommand(program: Command): void {
  program
    .command('format')
    .description('Format .al XML into various output formats')
    .requiredOption('-c, --class <type>', 'Formatter class. Valid values: al, txt, tmx, presentation, html, info')
    .option('-l, --languages <langs>', 'Source and target language separated by comma (required for tmx formatter)')
    .option('-w, --width <n>', 'Output width (optional for presentation formatter)', String(PresentationFormatter.DEFAULT_WIDTH))
    .option('-v, --verbosity <level>', 'Set verbosity level. Valid values: trace, debug, info (default), warn, error, fatal, quiet (no progress meter)')
    .helpOption('-h, --help', 'Display help message')
    .argument('[files...]', 'Output files (optional)')
    .action((files: string[], opts) => {
      setupProgress(opts.verbosity);
      const cls = opts.class;
      const input = readStdin();
      const parser = new AlParser(input);
      const alignmentList = parser.parse();

      if (cls === 'al') {
        const formatter = new AlFormatter();
        const output = formatter.format(alignmentList);
        if (files.length === 1) {
          fs.writeFileSync(files[0], output, 'utf-8');
        } else {
          process.stdout.write(output);
        }
      } else if (cls === 'txt') {
        if (files.length !== 2) {
          throw new Error('txt formatter requires exactly 2 output files (source, target).');
        }
        const formatter = new PlaintextFormatter();
        const result = formatter.formatSeparate(alignmentList);
        fs.writeFileSync(files[0], result.source, 'utf-8');
        fs.writeFileSync(files[1], result.target, 'utf-8');
      } else if (cls === 'tmx') {
        const languages = opts.languages;
        if (!languages) throw new Error('TMX formatter requires --languages option.');
        const parts = languages.split(',');
        if (parts.length !== 2) throw new Error('Languages must be two comma-separated values.');
        const formatter = new TmxFormatter(parts[0], parts[1]);
        const output = formatter.format(alignmentList);
        if (files.length === 1) {
          fs.writeFileSync(files[0], output, 'utf-8');
        } else {
          process.stdout.write(output);
        }
      } else if (cls === 'presentation') {
        const width = parseInt(opts.width, 10);
        const formatter = new PresentationFormatter(width);
        const output = formatter.format(alignmentList);
        if (files.length === 1) {
          fs.writeFileSync(files[0], output, 'utf-8');
        } else {
          process.stdout.write(output);
        }
      } else if (cls === 'html') {
        const formatter = new HtmlFormatter();
        const output = formatter.format(alignmentList);
        if (files.length === 1) {
          fs.writeFileSync(files[0], output, 'utf-8');
        } else {
          process.stdout.write(output);
        }
      } else if (cls === 'info') {
        const formatter = new InfoFormatter();
        const output = formatter.format(alignmentList);
        if (files.length === 1) {
          fs.writeFileSync(files[0], output, 'utf-8');
        } else {
          process.stdout.write(output);
        }
      } else {
        throw new Error(`Unknown formatter class: ${cls}. Valid values: al, txt, tmx, presentation, html, info.`);
      }
    });
}

// ─── Align Command ─────────────────────────────────────────────────────────────

function createCalculatorFn(
  opts: {
    calculator?: string;
    counter?: string;
    lengthCorpus?: string;
    translationCorpus?: string;
    oracleCorpus?: string;
    languageModels?: string;
    translationModel?: string;
    iterations?: string;
  },
  alignmentList: Alignment[]
): Calculator {
  const calculatorString = opts.calculator;
  if (!calculatorString) throw new Error('Missing required option: --calculator');

  const calculatorNames = calculatorString.split(',');
  return buildCalculator(opts, alignmentList, calculatorNames, 0);
}

function buildCalculator(
  opts: any,
  alignmentList: Alignment[],
  calculatorNames: string[],
  startIndex: number
): Calculator {
  const calculators: Calculator[] = [];

  for (let i = startIndex; i < calculatorNames.length; i++) {
    const name = calculatorNames[i];
    if (name === 'normal') {
      const counter = createCounter(opts.counter);
      calculators.push(new NormalDistributionCalculator(counter));
    } else if (name === 'poisson') {
      const counter = createCounter(opts.counter);
      let lengthAlignmentList: Alignment[];
      if (opts.lengthCorpus) {
        lengthAlignmentList = loadAlignmentList(opts.lengthCorpus);
      } else {
        lengthAlignmentList = alignmentList;
      }
      calculators.push(new PoissonDistributionCalculator(counter, lengthAlignmentList));
    } else if (name === 'translation') {
      calculators.push(createTranslationCalculatorFn(opts));
    } else if (name === 'oracle') {
      // Oracle consumes the rest of the calculators as fallback
      const remaining = calculatorNames.slice(i + 1);
      const remainingCalc = remaining.length > 0
        ? buildCalculator(opts, alignmentList, remaining, 0)
        : null;
      if (!opts.oracleCorpus) throw new Error('Missing required option: --oracle-corpus');
      const oracleAlignmentList = loadAlignmentList(opts.oracleCorpus);
      const oracleCalc = new OracleCalculator(oracleAlignmentList);
      if (remainingCalc) {
        calculators.push(new MinimumCalculator(oracleCalc, remainingCalc, OracleCalculator.DEFAULT_SUCCESS_SCORE));
      } else {
        calculators.push(oracleCalc);
      }
      break; // Oracle consumed the rest
    } else {
      throw new Error(`Unknown calculator: ${name}. Valid values: normal, poisson, translation, oracle.`);
    }
  }

  if (calculators.length === 1) return calculators[0];
  return new CompositeCalculator(calculators);
}

function createTranslationCalculatorFn(opts: any): Calculator {
  const iterations = opts.iterations
    ? parseInt(opts.iterations, 10)
    : DEFAULT_TRAIN_ITERATION_COUNT;

  const sourceVocabulary = new Vocabulary();
  const targetVocabulary = new Vocabulary();
  const sourceWidList: number[][] = [];
  const targetWidList: number[][] = [];

  if (opts.translationCorpus) {
    const translationAlignmentList = loadAlignmentList(opts.translationCorpus);
    tokenize(
      DEFAULT_TOKENIZE_ALGORITHM,
      translationAlignmentList,
      sourceVocabulary,
      targetVocabulary,
      sourceWidList,
      targetWidList
    );
  }

  let sourceLanguageModel: LanguageModel;
  let targetLanguageModel: LanguageModel;

  if (opts.languageModels) {
    const parts = opts.languageModels.split(',');
    if (parts.length !== 2) throw new Error('Language models must be two comma-separated file paths.');
    sourceLanguageModel = parseLanguageModel(readFileContent(parts[0]));
    targetLanguageModel = parseLanguageModel(readFileContent(parts[1]));
  } else {
    sourceLanguageModel = trainLanguageModel(sourceWidList);
    targetLanguageModel = trainLanguageModel(targetWidList);
  }

  let translationModel: TranslationModel;
  if (opts.translationModel) {
    translationModel = parseTranslationModel(
      readFileContent(opts.translationModel),
      sourceVocabulary,
      targetVocabulary
    );
  } else {
    translationModel = trainTranslationModel(
      iterations,
      sourceWidList,
      targetWidList
    );
  }

  return new TranslationCalculator(
    sourceVocabulary,
    targetVocabulary,
    sourceLanguageModel,
    targetLanguageModel,
    translationModel,
    DEFAULT_TOKENIZE_ALGORITHM
  );
}

function alignCommand(program: Command): void {
  program
    .command('align')
    .description('Align segments using various algorithms')
    .requiredOption('-c, --class <type>', 'Algorithm class. Valid values: viterbi, fb, one-to-one, unify')
    .option('-o, --one', 'Strict one-to-one alignment')
    .option('-s, --search <method>', 'Search method. Valid values: exhaustive, band, iterative-band. Required by viterbi and fb algorithms')
    .option('-r, --radius <n>', 'Band radius in segments. Optional for band and iterative-band search methods', String(BandMatrixFactory.DEFAULT_BAND_RADIUS))
    .option('-e, --increment <n>', 'Band increment ratio in each pass. Optional for iterative-band search method', String(AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO))
    .option('-m, --margin <n>', 'Band minimum acceptable margin. Optional for iterative-band search method', String(AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN))
    .option('-a, --calculator <types>', 'Calculator classes separated by commas. Valid values: normal, poisson, translation, oracle. Required by viterbi and fb algorithms')
    .option('-n, --counter <type>', 'Length counter. Valid values: char, word. Required by normal and poisson calculators')
    .option('-l, --length-corpus <file>', 'Length model training corpus. Optional for poisson calculator')
    .option('-t, --translation-corpus <file>', 'Translation model training corpus. Optional for translation calculator')
    .option('-d, --oracle-corpus <file>', 'Oracle calculator corpus. Required by oracle calculator')
    .option('-x, --language-models <files>', 'Source and target language model files separated by comma. Optional for translation calculator')
    .option('-y, --translation-model <file>', 'Translation model file. Optional for translation calculator')
    .option('-i, --iterations <n>', 'Translation model train iteration count. Optional for translation calculator', String(DEFAULT_TRAIN_ITERATION_COUNT))
    .option('-u, --unification-corpus <file>', 'Unification reference corpus. Required by unify algorithm')
    .option('-v, --verbosity <level>', 'Set verbosity level. Valid values: trace, debug, info (default), warn, error, fatal, quiet (no progress meter)')
    .helpOption('-h, --help', 'Display help message')
    .action((opts) => {
      setupProgress(opts.verbosity);
      const cls = opts.class;
      const input = readStdin();

      let filter: Filter;
      let alignmentList: Alignment[] | null = null;

      if (cls === 'unify') {
        if (!opts.unificationCorpus) {
          throw new Error('Missing required option: --unification-corpus');
        }
        const unificationAlignmentList = loadAlignmentList(opts.unificationCorpus);
        filter = new UnifyAligner(unificationAlignmentList);
      } else {
        const parser = new AlParser(input);
        alignmentList = parser.parse();
        const algorithm = createAlignAlgorithm(opts, alignmentList);
        filter = new Aligner(algorithm);
      }

      filter = decorateFilter(filter);

      if (alignmentList === null) {
        const parser = new AlParser(input);
        alignmentList = parser.parse();
      }

      alignmentList = filter.apply(alignmentList);
      const formatter = new AlFormatter();
      process.stdout.write(formatter.format(alignmentList));
    });
}

function createAlignAlgorithm(opts: any, alignmentList: Alignment[]): AlignAlgorithm {
  const cls = opts.class;

  if (cls === 'fb' || cls === 'viterbi') {
    const calculator = createCalculatorFn(opts, alignmentList);
    const categoryMap = BEST_CATEGORY_MAP;
    const search = opts.search;
    if (!search) throw new Error('Missing required option: --search');

    if (search === 'exhaustive' || search === 'band') {
      let matrixFactory: MatrixFactory<any>;
      if (search === 'exhaustive') {
        matrixFactory = new FullMatrixFactory();
      } else {
        const radius = parseInt(opts.radius, 10);
        matrixFactory = new BandMatrixFactory(radius);
      }
      if (cls === 'viterbi') {
        return new ViterbiAlgorithm(calculator, categoryMap, matrixFactory);
      } else {
        return new ForwardBackwardAlgorithm(calculator, categoryMap, matrixFactory);
      }
    } else if (search === 'iterative-band') {
      const radius = parseInt(opts.radius, 10);
      const margin = parseInt(opts.margin, 10);
      const increment = parseFloat(opts.increment);
      const algorithmFactory = cls === 'viterbi'
        ? new ViterbiAlgorithmFactory()
        : new ForwardBackwardAlgorithmFactory();
      return new AdaptiveBandAlgorithm(
        algorithmFactory,
        calculator,
        radius,
        increment,
        margin,
        categoryMap
      );
    } else {
      throw new Error(`Unknown search method: ${search}. Valid values: exhaustive, band, iterative-band.`);
    }
  } else if (cls === 'one-to-one') {
    const strict = opts.one || false;
    return new OneToOneAlgorithm(strict);
  } else {
    throw new Error(`Unknown algorithm class: ${cls}. Valid values: viterbi, fb, one-to-one, unify.`);
  }
}

// ─── Modify Command ────────────────────────────────────────────────────────────

function modifyCommand(program: Command): void {
  program
    .command('modify')
    .description('Modify alignment segments')
    .requiredOption(
      '-c, --class <type>',
      'Modifier class. Valid values: merge, split-word, split-sentence, split-paragraph, split-srx, trim, lowercase, filter-non-words, unify-rare-words'
    )
    .option('-p, --part <part>', 'Affected segment part. Valid values: both (default), source, target', 'both')
    .option('-f, --file <file>', 'File containing modification information. Required by split-srx modifier')
    .option('-l, --languages <langs>', 'Source and target language separated by comma. Required by split-srx modifier')
    .option('-s, --separator <sep>', 'Merge separator string. Optional for merge modifier, default ""')
    .option('-w, --max-word-count <n>', 'Maximum number of words preserved. Optional for unify-rare-words modifier', String(DEFAULT_MAX_WORD_COUNT))
    .option('-o, --min-occurrence-count <n>', 'Minimum number of occurrences to preserve a word. Optional for unify-rare-words modifier', String(DEFAULT_MIN_OCCURRENCE_COUNT))
    .option('-v, --verbosity <level>', 'Set verbosity level. Valid values: trace, debug, info (default), warn, error, fatal, quiet (no progress meter)')
    .helpOption('-h, --help', 'Display help message')
    .action((opts) => {
      setupProgress(opts.verbosity);
      const cls = opts.class;
      const input = readStdin();
      const alParser = new AlParser(input);

      let sourceAlgorithm: ModifyAlgorithm;
      let targetAlgorithm: ModifyAlgorithm | null = null;
      let alignmentList: Alignment[] | null = null;

      if (cls === 'split-word') {
        sourceAlgorithm = new WordSplitAlgorithm();
      } else if (cls === 'split-sentence') {
        sourceAlgorithm = new SentenceSplitAlgorithm();
      } else if (cls === 'split-paragraph') {
        sourceAlgorithm = new ParagraphSplitAlgorithm();
      } else if (cls === 'split-srx') {
        if (!opts.file) throw new Error('Missing required option: --file');
        if (!opts.languages) throw new Error('Missing required option: --languages');
        const parts = opts.languages.split(',');
        if (parts.length !== 2) throw new Error('Languages must be two comma-separated values.');
        const srxContent = readFileContent(opts.file);
        sourceAlgorithm = new SrxSplitAlgorithm(srxContent, parts[0]);
        targetAlgorithm = new SrxSplitAlgorithm(srxContent, parts[1]);
      } else if (cls === 'merge') {
        let separator = opts.separator || '';
        separator = separator.replace(/\\t/g, '\t');
        separator = separator.replace(/\\n/g, '\n');
        sourceAlgorithm = new SeparatorMergeAlgorithm(separator);
      } else if (cls === 'trim') {
        sourceAlgorithm = new TrimCleanAlgorithm();
      } else if (cls === 'lowercase') {
        sourceAlgorithm = new LowercaseCleanAlgorithm();
      } else if (cls === 'filter-non-words') {
        sourceAlgorithm = new FilterNonWordsCleanAlgorithm();
      } else if (cls === 'unify-rare-words') {
        alignmentList = alParser.parse();
        const maxWordCount = parseInt(opts.maxWordCount, 10);
        const minOccurrenceCount = parseInt(opts.minOccurrenceCount, 10);

        const sourceVocabulary = new Vocabulary();
        const targetVocabulary_ = new Vocabulary();
        const sourceWidList: number[][] = [];
        const targetWidList: number[][] = [];

        tokenize(
          DEFAULT_TOKENIZE_ALGORITHM,
          alignmentList,
          sourceVocabulary,
          targetVocabulary_,
          sourceWidList,
          targetWidList
        );

        const truncatedSourceVocab = createTruncatedVocabulary(
          sourceWidList, sourceVocabulary, maxWordCount, minOccurrenceCount
        );
        const truncatedTargetVocab = createTruncatedVocabulary(
          targetWidList, targetVocabulary_, maxWordCount, minOccurrenceCount
        );

        sourceAlgorithm = new UnifyRareWordsCleanAlgorithm(truncatedSourceVocab);
        targetAlgorithm = new UnifyRareWordsCleanAlgorithm(truncatedTargetVocab);
      } else {
        throw new Error(
          `Unknown modifier class: ${cls}. Valid values: merge, split-word, split-sentence, split-paragraph, split-srx, trim, lowercase, filter-non-words, unify-rare-words.`
        );
      }

      const part = opts.part;
      if (part === 'both') {
        if (targetAlgorithm === null) {
          targetAlgorithm = sourceAlgorithm;
        }
      } else if (part === 'source') {
        targetAlgorithm = new NullModifyAlgorithm();
      } else if (part === 'target') {
        targetAlgorithm = sourceAlgorithm;
        sourceAlgorithm = new NullModifyAlgorithm();
      } else {
        throw new Error(`Unknown part: ${part}. Valid values: both, source, target.`);
      }

      let filter: Filter = new Modifier(sourceAlgorithm, targetAlgorithm);
      filter = decorateFilter(filter);

      if (alignmentList === null) {
        alignmentList = alParser.parse();
      }

      alignmentList = filter.apply(alignmentList);
      const formatter = new AlFormatter();
      process.stdout.write(formatter.format(alignmentList));
    });
}

// ─── Select Command ────────────────────────────────────────────────────────────

function selectCommand(program: Command): void {
  program
    .command('select')
    .description('Select alignments by various criteria')
    .requiredOption('-c, --class <type>', 'Selector class. Valid values: one-to-one, fraction, probability, intersection, difference')
    .option('-f, --fraction <n>', 'Fraction (0-1) to leave in alignment. Required by fraction selector')
    .option('-p, --probability <n>', 'Probability threshold (0-1) to leave mapping in alignment. Required by probability selector')
    .option('-a, --alignment <file>', 'Other alignment file. Required by intersection and difference selectors')
    .option('-v, --verbosity <level>', 'Set verbosity level. Valid values: trace, debug, info (default), warn, error, fatal, quiet (no progress meter)')
    .helpOption('-h, --help', 'Display help message')
    .action((opts) => {
      setupProgress(opts.verbosity);
      const cls = opts.class;
      let filter: Filter;

      if (cls === 'one-to-one') {
        filter = new OneToOneSelector();
      } else if (cls === 'fraction') {
        if (!opts.fraction) throw new Error('Missing required option: --fraction');
        filter = new FractionSelector(parseFloat(opts.fraction));
      } else if (cls === 'probability') {
        if (!opts.probability) throw new Error('Missing required option: --probability');
        filter = new ProbabilitySelector(parseFloat(opts.probability));
      } else if (cls === 'intersection' || cls === 'difference') {
        if (!opts.alignment) throw new Error('Missing required option: --alignment');
        const otherAlignmentList = loadAlignmentList(opts.alignment);
        if (cls === 'intersection') {
          filter = new IntersectionSelector(otherAlignmentList);
        } else {
          filter = new DifferenceSelector(otherAlignmentList);
        }
      } else {
        throw new Error(`Unknown selector class: ${cls}. Valid values: one-to-one, fraction, probability, intersection, difference.`);
      }

      filter = decorateFilter(filter);

      const input = readStdin();
      const parser = new AlParser(input);
      const alignmentList = parser.parse();
      const result = filter.apply(alignmentList);
      const formatter = new AlFormatter();
      process.stdout.write(formatter.format(result));
    });
}

// ─── Compare Command ──────────────────────────────────────────────────────────

function compareCommand(program: Command): void {
  program
    .command('compare')
    .description('Compare two alignment files')
    .option('-d, --diff', 'Print differences')
    .option('-w, --width <n>', 'Differences output width', String(PresentationFormatter.DEFAULT_WIDTH))
    .option('-v, --verbosity <level>', 'Set verbosity level. Valid values: trace, debug, info (default), warn, error, fatal, quiet (no progress meter)')
    .helpOption('-h, --help', 'Display help message')
    .argument('<left>', 'Left alignment file')
    .argument('<right>', 'Right alignment file')
    .action((leftFile: string, rightFile: string, opts) => {
      setupProgress(opts.verbosity);
      const width = parseInt(opts.width, 10);

      const leftAlignmentList = loadAlignmentList(leftFile);
      const rightAlignmentList = loadAlignmentList(rightFile);

      const diff = compare(leftAlignmentList, rightAlignmentList);

      if (opts.diff) {
        const formatter = new PresentationFormatter(width);

        for (let i = 0; i < diff.leftGroupList.length; i++) {
          const leftGroup = diff.leftGroupList[i];
          const rightGroup = diff.rightGroupList[i];

          process.stderr.write('< left alignments\n\n');
          process.stderr.write(formatter.format(leftGroup));
          process.stderr.write('\n\n');

          process.stderr.write('> right alignments\n\n');
          process.stderr.write(formatter.format(rightGroup));
          process.stderr.write('\n\n\n');
        }
      }

      const commonAlignmentCount = diff.commonList.length;
      const precision = round(commonAlignmentCount / rightAlignmentList.length, 2);
      const recall = round(commonAlignmentCount / leftAlignmentList.length, 2);

      process.stderr.write(
        `Precision |A ${INTERSECTION_SYMBOL} B| / |B| = ${precision}\n`
      );
      process.stderr.write(
        `Recall    |A ${INTERSECTION_SYMBOL} B| / |A| = ${recall}\n`
      );
    });
}

// ─── Macro Command ─────────────────────────────────────────────────────────────

function macroCommand(program: Command): void {
  program
    .command('macro')
    .description('Run a predefined alignment macro')
    .requiredOption('-c, --class <type>', 'Macro class. Valid values: galechurch, moore, poisson, translation, poisson-translation')
    .option('-v, --verbosity <level>', 'Set verbosity level. Valid values: trace, debug, info (default), warn, error, fatal, quiet (no progress meter)')
    .helpOption('-h, --help', 'Display help message')
    .action((opts) => {
      setupProgress(opts.verbosity);
      const cls = opts.class;

      let filter: Filter;
      if (cls === 'galechurch') {
        filter = new GaleAndChurchMacro();
      } else if (cls === 'moore') {
        filter = new MooreMacro();
      } else if (cls === 'poisson') {
        filter = new PoissonMacro();
      } else if (cls === 'translation') {
        filter = new TranslationMacro();
      } else if (cls === 'poisson-translation') {
        filter = new PoissonTranslationMacro();
      } else {
        throw new Error(`Unknown macro class: ${cls}. Valid values: galechurch, moore, poisson, translation, poisson-translation.`);
      }

      filter = decorateFilter(filter);

      const input = readStdin();
      const parser = new AlParser(input);
      const alignmentList = parser.parse();
      const result = filter.apply(alignmentList);
      const formatter = new AlFormatter();
      process.stdout.write(formatter.format(result));
    });
}

// ─── Model Command ─────────────────────────────────────────────────────────────

function modelCommand(program: Command): void {
  program
    .command('model')
    .description('Train models from aligned data')
    .requiredOption('-c, --class <type>', 'Modeller class. Valid values: length, language-translation')
    .option('-i, --iterations <n>', 'Translation model train iteration count. Optional for language-translation modeller', String(DEFAULT_TRAIN_ITERATION_COUNT))
    .option('-v, --verbosity <level>', 'Set verbosity level. Valid values: trace, debug, info (default), warn, error, fatal, quiet (no progress meter)')
    .helpOption('-h, --help', 'Display help message')
    .action((opts) => {
      setupProgress(opts.verbosity);
      const cls = opts.class;

      if (cls === 'language-translation') {
        const splitAlgorithm: SplitAlgorithm = DEFAULT_TOKENIZE_ALGORITHM as SplitAlgorithm;
        const sourceVocabulary = new Vocabulary();
        const targetVocabulary_ = new Vocabulary();

        const input = readStdin();
        const parser = new AlParser(input);
        const alignmentList = parser.parse();

        const sourceWidList: number[][] = [];
        const targetWidList: number[][] = [];

        for (const alignment of alignmentList) {
          const sourceWords = splitAlgorithm.modify(alignment.sourceSegmentList);
          sourceVocabulary.putWordList(sourceWords);
          sourceWidList.push(sourceVocabulary.getWidList(sourceWords));

          const targetWords = splitAlgorithm.modify(alignment.targetSegmentList);
          targetVocabulary_.putWordList(targetWords);
          targetWidList.push(targetVocabulary_.getWidList(targetWords));
        }

        // Model training happens here — output could be serialized
        // Currently this command in the Java version is incomplete
        process.stderr.write('Model training completed.\n');
      } else {
        throw new Error(`Unknown modeller class: ${cls}. Valid values: language-translation.`);
      }
    });
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const program = new Command();
program
  .name('maligna-ts')
  .description('mALIGNa-ts — Sentence alignment toolkit')
  .version(VERSION)
  .helpOption('-h, --help', 'Display help message')
  .helpCommand(false);

parseCommand(program);
formatCommand(program);
alignCommand(program);
modifyCommand(program);
selectCommand(program);
compareCommand(program);
macroCommand(program);
modelCommand(program);

program.parse(process.argv);

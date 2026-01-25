import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  Alignment,
  PlaintextParser,
  AlParser,
  TmxParser,
  AlFormatter,
  TmxFormatter,
  PresentationFormatter,
  InfoFormatter,
  PlaintextFormatter,
  GaleAndChurchMacro,
  PoissonMacro,
  MooreMacro,
  Filter,
  Modifier,
  CompositeFilter,
  SentenceSplitAlgorithm,
  WordSplitAlgorithm,
  ParagraphSplitAlgorithm,
  TrimCleanAlgorithm,
  LowercaseCleanAlgorithm,
  SeparatorMergeAlgorithm,
  OneToOneSelector,
  FractionSelector,
  ProbabilitySelector,
  NullModifyAlgorithm,
} from 'maligna-ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to examples directory
const EXAMPLES_DIR = path.resolve(__dirname, '..', '..', '..', 'examples', 'txt');

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface AlignParams {
  sourceText: string;
  targetText: string;
  algorithm: string;
  format: string;
  sourceLanguage: string;
  targetLanguage: string;
  presentationWidth?: number;
  // Pre-processing options
  splitAlgorithm?: string;
  applyTrim?: boolean;
  applyLowercase?: boolean;
  // Post-processing (selection) options
  selector?: string;
  selectorFraction?: number;
  selectorProbability?: number;
}

export interface ParseParams {
  sourceText: string;
  targetText: string;
  parserType?: string;
  splitAlgorithm?: string;
  applyTrim?: boolean;
  applyLowercase?: boolean;
  tmxSourceLang?: string;
  tmxTargetLang?: string;
}

export interface ModifyParams {
  sourceText: string;
  targetText: string;
  operations: ModifyOperation[];
}

export interface ModifyOperation {
  type: 'split' | 'merge' | 'clean';
  algorithm: string;
  applyToSource?: boolean;
  applyToTarget?: boolean;
  separator?: string;
}

export interface SelectParams {
  alignments: AlignmentInfo[];
  selector: string;
  fraction?: number;
  probability?: number;
}

export interface AlignResult {
  alignments: AlignmentInfo[];
  formatted: string;
  stats: AlignmentStats;
}

export interface AlignmentStats {
  totalAlignments: number;
  sourceSegments: number;
  targetSegments: number;
  alignmentTypes: Record<string, number>;
  processingTimeMs: number;
  averageScore?: number;
  oneToOneCount?: number;
  oneToOnePercentage?: number;
}

export interface AlignmentInfo {
  sourceSegments: string[];
  targetSegments: string[];
  category: string;
  score: number;
  probability?: number;
}

export interface ParseResult {
  sourceSegments: string[];
  targetSegments: string[];
  segmentCount: { source: number; target: number };
  alignments?: AlignmentInfo[];
}

export interface ExamplePair {
  name: string;
  sourceFile: string;
  targetFile: string;
  sourceLanguage: string;
  targetLanguage: string;
  description: string;
  approximateSize: string;
}

export interface LibraryCapabilities {
  parsers: OptionInfo[];
  formatters: OptionInfo[];
  algorithms: OptionInfo[];
  splitAlgorithms: OptionInfo[];
  cleanAlgorithms: OptionInfo[];
  mergeAlgorithms: OptionInfo[];
  selectors: OptionInfo[];
  languages: OptionInfo[];
}

export interface OptionInfo {
  id: string;
  name: string;
  description: string;
  parameters?: ParameterInfo[];
}

export interface ParameterInfo {
  name: string;
  type: string;
  default?: string | number | boolean;
  min?: number;
  max?: number;
  description: string;
}

// ============================================================================
// AlignmentService Class
// ============================================================================

export class AlignmentService {
  private examplePairs: ExamplePair[];

  constructor() {
    this.examplePairs = this.discoverExamples();
  }

  // --------------------------------------------------------------------------
  // Capabilities - describe all library options
  // --------------------------------------------------------------------------

  getCapabilities(): LibraryCapabilities {
    return {
      parsers: [
        { id: 'txt', name: 'Plain Text', description: 'Parse plain text files (source + target)' },
        { id: 'al', name: 'AL Format', description: 'Parse mALIGNa internal alignment format' },
        { id: 'tmx', name: 'TMX', description: 'Parse Translation Memory eXchange files', parameters: [
          { name: 'sourceLanguage', type: 'string', description: 'Source language code' },
          { name: 'targetLanguage', type: 'string', description: 'Target language code' },
        ]},
      ],
      formatters: [
        { id: 'presentation', name: 'Presentation', description: 'Human-readable side-by-side format', parameters: [
          { name: 'width', type: 'number', default: 79, min: 5, max: 200, description: 'Output width in characters' },
        ]},
        { id: 'al', name: 'AL Format', description: 'Internal alignment format (can be re-parsed)' },
        { id: 'tmx', name: 'TMX', description: 'Translation Memory eXchange XML format', parameters: [
          { name: 'sourceLanguage', type: 'string', description: 'Source language code' },
          { name: 'targetLanguage', type: 'string', description: 'Target language code' },
        ]},
        { id: 'txt', name: 'Plain Text', description: 'Plain text output (source and target separated)' },
        { id: 'info', name: 'Info/Statistics', description: 'Alignment statistics and category counts' },
      ],
      algorithms: [
        { id: 'moore', name: 'Moore Algorithm', description: 'Two-pass algorithm: length-based alignment followed by content-based refinement using translation models. Best quality, slower for large texts.' },
        { id: 'galechurch', name: 'Gale & Church', description: 'Classic algorithm using character-based length with normal distribution. Fast and reliable for similar-length languages.' },
        { id: 'poisson', name: 'Poisson', description: 'Word-count based alignment using Poisson distribution. Good balance of speed and quality.' },
      ],
      splitAlgorithms: [
        { id: 'sentence', name: 'Sentence Split', description: 'Split text into sentences (using punctuation heuristics)' },
        { id: 'paragraph', name: 'Paragraph Split', description: 'Split text into paragraphs (by empty lines)' },
        { id: 'word', name: 'Word Split', description: 'Split text into individual words' },
        { id: 'none', name: 'No Split', description: 'Keep text as-is without splitting' },
      ],
      cleanAlgorithms: [
        { id: 'trim', name: 'Trim Whitespace', description: 'Remove leading/trailing whitespace from segments' },
        { id: 'lowercase', name: 'Lowercase', description: 'Convert segments to lowercase' },
        { id: 'none', name: 'No Cleaning', description: 'Keep segments as-is' },
      ],
      mergeAlgorithms: [
        { id: 'separator', name: 'Separator Merge', description: 'Merge segments using a separator', parameters: [
          { name: 'separator', type: 'string', default: ' ', description: 'String to insert between merged segments' },
        ]},
      ],
      selectors: [
        { id: 'none', name: 'No Selection', description: 'Keep all alignments' },
        { id: 'onetoone', name: '1-1 Only', description: 'Keep only one-to-one alignments (remove merges/splits)' },
        { id: 'fraction', name: 'Top Fraction', description: 'Keep top N% of alignments by probability', parameters: [
          { name: 'fraction', type: 'number', default: 0.8, min: 0, max: 1, description: 'Fraction to keep (0-1)' },
        ]},
        { id: 'probability', name: 'Probability Threshold', description: 'Keep alignments above probability threshold', parameters: [
          { name: 'probability', type: 'number', default: 0.5, min: 0, max: 1, description: 'Minimum probability (0-1)' },
        ]},
      ],
      languages: [
        { id: 'en', name: 'English', description: '' },
        { id: 'pl', name: 'Polish', description: '' },
        { id: 'de', name: 'German', description: '' },
        { id: 'fr', name: 'French', description: '' },
        { id: 'es', name: 'Spanish', description: '' },
        { id: 'it', name: 'Italian', description: '' },
        { id: 'pt', name: 'Portuguese', description: '' },
        { id: 'nl', name: 'Dutch', description: '' },
        { id: 'ru', name: 'Russian', description: '' },
        { id: 'zh', name: 'Chinese', description: '' },
        { id: 'ja', name: 'Japanese', description: '' },
        { id: 'ko', name: 'Korean', description: '' },
        { id: 'ar', name: 'Arabic', description: '' },
        { id: 'cs', name: 'Czech', description: '' },
        { id: 'sk', name: 'Slovak', description: '' },
        { id: 'uk', name: 'Ukrainian', description: '' },
        { id: 'bg', name: 'Bulgarian', description: '' },
        { id: 'hr', name: 'Croatian', description: '' },
        { id: 'sr', name: 'Serbian', description: '' },
        { id: 'sl', name: 'Slovenian', description: '' },
      ],
    };
  }

  // --------------------------------------------------------------------------
  // Example Files
  // --------------------------------------------------------------------------

  private discoverExamples(): ExamplePair[] {
    const pairs: ExamplePair[] = [];
    
    const knownPairs = [
      { name: 'poznan-small', source: 'poznan-small-pl.txt', target: 'poznan-small-de.txt', srcLang: 'pl', tgtLang: 'de', desc: 'Poznań city description (small excerpt)', size: '~3 sentences' },
      { name: 'help', source: 'help-en.txt', target: 'help-pl.txt', srcLang: 'en', tgtLang: 'pl', desc: 'Help documentation about automatic translation', size: '~1000 sentences' },
      { name: 'gpl', source: 'gpl-en.txt', target: 'gpl-pl.txt', srcLang: 'en', tgtLang: 'pl', desc: 'GNU GPL License text', size: '~300 sentences' },
      { name: 'poznan', source: 'poznan-pl.txt', target: 'poznan-de.txt', srcLang: 'pl', tgtLang: 'de', desc: 'Poznań city description', size: '~100 sentences' },
      { name: 'stallman-ch1', source: 'stallman-ch1-en.txt', target: 'stallman-ch1-pl.txt', srcLang: 'en', tgtLang: 'pl', desc: 'Richard Stallman biography - Chapter 1', size: '~200 sentences' },
      { name: 'stallman', source: 'stallman-en.txt', target: 'stallman-pl.txt', srcLang: 'en', tgtLang: 'pl', desc: 'Richard Stallman biography (full)', size: '~2000 sentences' },
    ];

    for (const pair of knownPairs) {
      const sourcePath = path.join(EXAMPLES_DIR, pair.source);
      const targetPath = path.join(EXAMPLES_DIR, pair.target);
      
      if (fs.existsSync(sourcePath) && fs.existsSync(targetPath)) {
        pairs.push({
          name: pair.name,
          sourceFile: pair.source,
          targetFile: pair.target,
          sourceLanguage: pair.srcLang,
          targetLanguage: pair.tgtLang,
          description: pair.desc,
          approximateSize: pair.size,
        });
      }
    }

    return pairs;
  }

  getExamplePairs(): ExamplePair[] {
    return this.examplePairs;
  }

  getExampleContent(name: string): { sourceText: string; targetText: string; pair: ExamplePair } | null {
    const pair = this.examplePairs.find(p => p.name === name);
    if (!pair) {
      return null;
    }

    const sourcePath = path.join(EXAMPLES_DIR, pair.sourceFile);
    const targetPath = path.join(EXAMPLES_DIR, pair.targetFile);

    try {
      const sourceText = fs.readFileSync(sourcePath, 'utf-8');
      const targetText = fs.readFileSync(targetPath, 'utf-8');
      return { sourceText, targetText, pair };
    } catch {
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // Parsing
  // --------------------------------------------------------------------------

  parse(params: ParseParams): ParseResult {
    let alignmentList: Alignment[];

    // Choose parser
    switch (params.parserType) {
      case 'al':
        const alParser = new AlParser(params.sourceText);
        alignmentList = alParser.parse();
        break;
      case 'tmx':
        const tmxParser = new TmxParser(
          params.sourceText,
          params.tmxSourceLang || 'en',
          params.tmxTargetLang || 'pl'
        );
        alignmentList = tmxParser.parse();
        break;
      case 'txt':
      default:
        const txtParser = new PlaintextParser(params.sourceText, params.targetText);
        alignmentList = txtParser.parse();
        break;
    }

    // Apply split algorithm
    if (params.splitAlgorithm && params.splitAlgorithm !== 'none') {
      const splitAlg = this.createSplitAlgorithm(params.splitAlgorithm);
      const modifier = new Modifier(splitAlg, splitAlg);
      alignmentList = modifier.apply(alignmentList);
    }

    // Apply cleaning
    if (params.applyTrim) {
      const trimAlg = new TrimCleanAlgorithm();
      const modifier = new Modifier(trimAlg, trimAlg);
      alignmentList = modifier.apply(alignmentList);
    }

    if (params.applyLowercase) {
      const lowerAlg = new LowercaseCleanAlgorithm();
      const modifier = new Modifier(lowerAlg, lowerAlg);
      alignmentList = modifier.apply(alignmentList);
    }

    // Extract segments
    const sourceSegments: string[] = [];
    const targetSegments: string[] = [];

    for (const alignment of alignmentList) {
      sourceSegments.push(...alignment.sourceSegmentList);
      targetSegments.push(...alignment.targetSegmentList);
    }

    return {
      sourceSegments,
      targetSegments,
      segmentCount: {
        source: sourceSegments.length,
        target: targetSegments.length,
      },
      alignments: alignmentList.map(a => ({
        sourceSegments: [...a.sourceSegmentList],
        targetSegments: [...a.targetSegmentList],
        category: a.category.toString(),
        score: a.score,
      })),
    };
  }

  // --------------------------------------------------------------------------
  // Modification (split/merge/clean)
  // --------------------------------------------------------------------------

  modify(params: ModifyParams): ParseResult {
    const parser = new PlaintextParser(params.sourceText, params.targetText);
    let alignmentList = parser.parse();

    for (const op of params.operations) {
      const applyToSource = op.applyToSource !== false;
      const applyToTarget = op.applyToTarget !== false;

      let sourceAlg: any;
      let targetAlg: any;

      switch (op.type) {
        case 'split':
          const splitAlg = this.createSplitAlgorithm(op.algorithm);
          sourceAlg = applyToSource ? splitAlg : new NullModifyAlgorithm();
          targetAlg = applyToTarget ? splitAlg : new NullModifyAlgorithm();
          break;
        case 'clean':
          const cleanAlg = this.createCleanAlgorithm(op.algorithm);
          sourceAlg = applyToSource ? cleanAlg : new NullModifyAlgorithm();
          targetAlg = applyToTarget ? cleanAlg : new NullModifyAlgorithm();
          break;
        case 'merge':
          const mergeAlg = new SeparatorMergeAlgorithm(op.separator || ' ');
          sourceAlg = applyToSource ? mergeAlg : new NullModifyAlgorithm();
          targetAlg = applyToTarget ? mergeAlg : new NullModifyAlgorithm();
          break;
      }

      const modifier = new Modifier(sourceAlg, targetAlg);
      alignmentList = modifier.apply(alignmentList);
    }

    const sourceSegments: string[] = [];
    const targetSegments: string[] = [];

    for (const alignment of alignmentList) {
      sourceSegments.push(...alignment.sourceSegmentList);
      targetSegments.push(...alignment.targetSegmentList);
    }

    return {
      sourceSegments,
      targetSegments,
      segmentCount: {
        source: sourceSegments.length,
        target: targetSegments.length,
      },
    };
  }

  // --------------------------------------------------------------------------
  // Full Alignment Pipeline
  // --------------------------------------------------------------------------

  align(params: AlignParams): AlignResult {
    const startTime = Date.now();

    // Parse input
    const parser = new PlaintextParser(params.sourceText, params.targetText);
    let alignmentList = parser.parse();

    // Pre-processing: split
    const splitAlgorithm = params.splitAlgorithm || 'sentence';
    if (splitAlgorithm !== 'none') {
      const splitAlg = this.createSplitAlgorithm(splitAlgorithm);
      const splitModifier = new Modifier(splitAlg, splitAlg);
      alignmentList = splitModifier.apply(alignmentList);
    }

    // Pre-processing: clean
    if (params.applyTrim) {
      const trimAlg = new TrimCleanAlgorithm();
      const modifier = new Modifier(trimAlg, trimAlg);
      alignmentList = modifier.apply(alignmentList);
    }

    if (params.applyLowercase) {
      const lowerAlg = new LowercaseCleanAlgorithm();
      const modifier = new Modifier(lowerAlg, lowerAlg);
      alignmentList = modifier.apply(alignmentList);
    }

    // Alignment algorithm
    let filter: Filter;
    switch (params.algorithm) {
      case 'galechurch':
        filter = new GaleAndChurchMacro();
        break;
      case 'poisson':
        filter = new PoissonMacro();
        break;
      case 'moore':
      default:
        filter = new MooreMacro();
        break;
    }

    alignmentList = filter.apply(alignmentList);

    // Post-processing: selection
    if (params.selector && params.selector !== 'none') {
      const selectorFilter = this.createSelector(
        params.selector,
        params.selectorFraction,
        params.selectorProbability
      );
      alignmentList = selectorFilter.apply(alignmentList);
    }

    // Format output
    const formatted = this.formatAlignments(alignmentList, params);

    // Build result
    const alignments = this.buildAlignmentInfo(alignmentList);
    const stats = this.calculateStats(alignmentList, startTime);

    return { alignments, formatted, stats };
  }

  // --------------------------------------------------------------------------
  // Formatting
  // --------------------------------------------------------------------------

  format(alignments: AlignmentInfo[], formatType: string, options: {
    sourceLanguage?: string;
    targetLanguage?: string;
    width?: number;
  } = {}): string {
    // Convert AlignmentInfo back to Alignment objects
    const alignmentList = alignments.map(a => {
      return new Alignment(a.sourceSegments, a.targetSegments, a.score);
    });

    return this.formatAlignments(alignmentList, {
      format: formatType,
      sourceLanguage: options.sourceLanguage || 'en',
      targetLanguage: options.targetLanguage || 'pl',
      presentationWidth: options.width,
    } as AlignParams);
  }

  private formatAlignments(alignmentList: Alignment[], params: Partial<AlignParams>): string {
    switch (params.format) {
      case 'al':
        return new AlFormatter().format(alignmentList);
      case 'tmx':
        return new TmxFormatter(
          params.sourceLanguage || 'en',
          params.targetLanguage || 'pl'
        ).format(alignmentList);
      case 'txt':
        const txtFormatter = new PlaintextFormatter();
        const result = txtFormatter.formatSeparate(alignmentList);
        // Match CLI format: source\n---\ntarget
        return `${result.source}\n---\n${result.target}`;
      case 'info':
        return new InfoFormatter().format(alignmentList);
      case 'presentation':
      default:
        const width = params.presentationWidth || 80;
        return new PresentationFormatter(width).format(alignmentList);
    }
  }

  // --------------------------------------------------------------------------
  // Selection
  // --------------------------------------------------------------------------

  select(alignments: AlignmentInfo[], selector: string, options: {
    fraction?: number;
    probability?: number;
  } = {}): AlignmentInfo[] {
    const alignmentList = alignments.map(a => {
      return new Alignment(a.sourceSegments, a.targetSegments, a.score);
    });

    const filter = this.createSelector(selector, options.fraction, options.probability);
    const filtered = filter.apply(alignmentList);

    return this.buildAlignmentInfo(filtered);
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private createSplitAlgorithm(algorithm: string) {
    switch (algorithm) {
      case 'word':
        return new WordSplitAlgorithm();
      case 'paragraph':
        return new ParagraphSplitAlgorithm();
      case 'sentence':
      default:
        return new SentenceSplitAlgorithm();
    }
  }

  private createCleanAlgorithm(algorithm: string) {
    switch (algorithm) {
      case 'lowercase':
        return new LowercaseCleanAlgorithm();
      case 'trim':
      default:
        return new TrimCleanAlgorithm();
    }
  }

  private createSelector(selector: string, fraction?: number, probability?: number): Filter {
    switch (selector) {
      case 'onetoone':
        return new OneToOneSelector();
      case 'fraction':
        return new FractionSelector(fraction ?? 0.8);
      case 'probability':
        return new ProbabilitySelector(probability ?? 0.5);
      default:
        return { apply: (list: Alignment[]) => list };
    }
  }

  private buildAlignmentInfo(alignmentList: Alignment[]): AlignmentInfo[] {
    return alignmentList.map(a => ({
      sourceSegments: [...a.sourceSegmentList],
      targetSegments: [...a.targetSegmentList],
      category: a.category.toString(),
      score: a.score,
      probability: Math.exp(-a.score),
    }));
  }

  private calculateStats(alignmentList: Alignment[], startTime: number): AlignmentStats {
    const alignmentTypes: Record<string, number> = {};
    let sourceSegments = 0;
    let targetSegments = 0;
    let totalScore = 0;
    let oneToOneCount = 0;

    for (const a of alignmentList) {
      const cat = a.category.toString();
      alignmentTypes[cat] = (alignmentTypes[cat] || 0) + 1;
      sourceSegments += a.sourceSegmentList.length;
      targetSegments += a.targetSegmentList.length;
      totalScore += a.score;

      if (a.sourceSegmentList.length === 1 && a.targetSegmentList.length === 1) {
        oneToOneCount++;
      }
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      totalAlignments: alignmentList.length,
      sourceSegments,
      targetSegments,
      alignmentTypes,
      processingTimeMs,
      averageScore: alignmentList.length > 0 ? totalScore / alignmentList.length : 0,
      oneToOneCount,
      oneToOnePercentage: alignmentList.length > 0 ? (oneToOneCount / alignmentList.length) * 100 : 0,
    };
  }
}

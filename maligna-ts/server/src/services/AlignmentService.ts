import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  Alignment,
  PlaintextParser,
  AlFormatter,
  TmxFormatter,
  PresentationFormatter,
  InfoFormatter,
  GaleAndChurchMacro,
  PoissonMacro,
  MooreMacro,
  Filter,
  Modifier,
  SentenceSplitAlgorithm,
  WordSplitAlgorithm,
  ParagraphSplitAlgorithm,
} from 'maligna-ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to examples directory
const EXAMPLES_DIR = path.resolve(__dirname, '..', '..', '..', 'examples', 'txt');

export interface AlignParams {
  sourceText: string;
  targetText: string;
  algorithm: string;
  format: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface ParseParams {
  sourceText: string;
  targetText: string;
  splitAlgorithm: string;
}

export interface AlignResult {
  alignments: AlignmentInfo[];
  formatted: string;
  stats: {
    totalAlignments: number;
    sourceSegments: number;
    targetSegments: number;
    alignmentTypes: Record<string, number>;
    processingTimeMs: number;
  };
}

export interface AlignmentInfo {
  sourceSegments: string[];
  targetSegments: string[];
  category: string;
  score: number;
}

export interface ExamplePair {
  name: string;
  sourceFile: string;
  targetFile: string;
  sourceLanguage: string;
  targetLanguage: string;
  description: string;
}

export class AlignmentService {
  private examplePairs: ExamplePair[];

  constructor() {
    this.examplePairs = this.discoverExamples();
  }

  private discoverExamples(): ExamplePair[] {
    const pairs: ExamplePair[] = [];
    
    // Define known example pairs
    const knownPairs = [
      { name: 'gpl', source: 'gpl-en.txt', target: 'gpl-pl.txt', srcLang: 'en', tgtLang: 'pl', desc: 'GNU GPL License text' },
      { name: 'help', source: 'help-en.txt', target: 'help-pl.txt', srcLang: 'en', tgtLang: 'pl', desc: 'Help documentation about automatic translation' },
      { name: 'poznan', source: 'poznan-pl.txt', target: 'poznan-de.txt', srcLang: 'pl', tgtLang: 'de', desc: 'Poznań city description' },
      { name: 'poznan-small', source: 'poznan-small-pl.txt', target: 'poznan-small-de.txt', srcLang: 'pl', tgtLang: 'de', desc: 'Poznań city description (small excerpt)' },
      { name: 'stallman', source: 'stallman-en.txt', target: 'stallman-pl.txt', srcLang: 'en', tgtLang: 'pl', desc: 'Richard Stallman biography' },
      { name: 'stallman-ch1', source: 'stallman-ch1-en.txt', target: 'stallman-ch1-pl.txt', srcLang: 'en', tgtLang: 'pl', desc: 'Richard Stallman biography - Chapter 1' },
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

  parse(params: ParseParams): { sourceSegments: string[]; targetSegments: string[]; segmentCount: { source: number; target: number } } {
    // Create initial alignment
    const parser = new PlaintextParser(params.sourceText, params.targetText);
    let alignmentList = parser.parse();

    // Choose split algorithm
    let splitAlgorithm;
    switch (params.splitAlgorithm) {
      case 'word':
        splitAlgorithm = new WordSplitAlgorithm();
        break;
      case 'paragraph':
        splitAlgorithm = new ParagraphSplitAlgorithm();
        break;
      case 'sentence':
      default:
        splitAlgorithm = new SentenceSplitAlgorithm();
        break;
    }

    // Apply splitting
    const modifier = new Modifier(splitAlgorithm, splitAlgorithm);
    alignmentList = modifier.apply(alignmentList);

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
    };
  }

  align(params: AlignParams): AlignResult {
    const startTime = Date.now();

    // Parse input
    const parser = new PlaintextParser(params.sourceText, params.targetText);
    let alignmentList = parser.parse();

    // Split into sentences
    const sentenceSplitAlgorithm = new SentenceSplitAlgorithm();
    const splitModifier = new Modifier(sentenceSplitAlgorithm, sentenceSplitAlgorithm);
    alignmentList = splitModifier.apply(alignmentList);

    // Choose alignment algorithm
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

    // Apply alignment
    alignmentList = filter.apply(alignmentList);

    // Format output
    let formatted: string;
    switch (params.format) {
      case 'al':
        formatted = new AlFormatter().format(alignmentList);
        break;
      case 'tmx':
        formatted = new TmxFormatter(params.sourceLanguage, params.targetLanguage).format(alignmentList);
        break;
      case 'info':
        formatted = new InfoFormatter().format(alignmentList);
        break;
      case 'presentation':
      default:
        formatted = new PresentationFormatter(80).format(alignmentList);
        break;
    }

    // Build alignment info
    const alignments: AlignmentInfo[] = alignmentList.map(a => ({
      sourceSegments: [...a.sourceSegmentList],
      targetSegments: [...a.targetSegmentList],
      category: a.category.toString(),
      score: a.score,
    }));

    // Calculate stats
    const alignmentTypes: Record<string, number> = {};
    let sourceSegments = 0;
    let targetSegments = 0;

    for (const a of alignmentList) {
      const cat = a.category.toString();
      alignmentTypes[cat] = (alignmentTypes[cat] || 0) + 1;
      sourceSegments += a.sourceSegmentList.length;
      targetSegments += a.targetSegmentList.length;
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      alignments,
      formatted,
      stats: {
        totalAlignments: alignmentList.length,
        sourceSegments,
        targetSegments,
        alignmentTypes,
        processingTimeMs,
      },
    };
  }
}

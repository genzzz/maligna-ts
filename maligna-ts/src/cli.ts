#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import { Alignment } from './coretypes/index.js';
import { AlParser, PlaintextParser, TmxParser } from './parser/index.js';
import { AlFormatter, PlaintextFormatter, TmxFormatter, InfoFormatter, PresentationFormatter } from './formatter/index.js';
import { GaleAndChurchMacro, PoissonMacro, MooreMacro } from './filter/macro/index.js';
import { Filter } from './filter/Filter.js';
import { Modifier } from './filter/modifier/Modifier.js';
import { SentenceSplitAlgorithm, WordSplitAlgorithm, ParagraphSplitAlgorithm } from './filter/modifier/modify/split/index.js';
import { TrimCleanAlgorithm, LowercaseCleanAlgorithm } from './filter/modifier/modify/clean/index.js';
import { SeparatorMergeAlgorithm } from './filter/modifier/modify/merge/index.js';
import { OneToOneSelector, FractionSelector, ProbabilitySelector } from './filter/selector/index.js';

const VERSION = '3.0.0';

const program = new Command();

program
  .name('maligna')
  .description('mALIGNa - Sentence alignment tool')
  .version(VERSION);

// Parse command
program
  .command('parse')
  .description('Parse input files into alignment format')
  .requiredOption('-c, --class <type>', 'Parser class: al, txt, tmx')
  .option('-l, --languages <langs>', 'Source and target language (comma-separated, for tmx)')
  .argument('[files...]', 'Input files')
  .action((files: string[], options: { class: string; languages?: string }) => {
    const alignmentList: Alignment[] = [];

    if (options.class === 'al') {
      for (const fileName of files) {
        const content = fs.readFileSync(fileName, 'utf-8');
        const parser = new AlParser(content);
        alignmentList.push(...parser.parse());
      }
    } else if (options.class === 'txt') {
      if (files.length % 2 !== 0) {
        console.error('Text parser requires pairs of source and target files');
        process.exit(1);
      }
      for (let i = 0; i < files.length; i += 2) {
        const sourceFile = files[i]!;
        const targetFile = files[i + 1]!;
        const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
        const targetContent = fs.readFileSync(targetFile, 'utf-8');
        const parser = new PlaintextParser(sourceContent, targetContent);
        alignmentList.push(...parser.parse());
      }
    } else if (options.class === 'tmx') {
      for (const fileName of files) {
        const content = fs.readFileSync(fileName, 'utf-8');
        let parser: TmxParser;
        if (options.languages) {
          const langs = options.languages.split(',');
          parser = new TmxParser(content, langs[0]!, langs[1]!);
        } else {
          parser = new TmxParser(content);
        }
        alignmentList.push(...parser.parse());
      }
    } else {
      console.error(`Unknown parser class: ${options.class}`);
      process.exit(1);
    }

    const formatter = new AlFormatter();
    console.log(formatter.format(alignmentList));
  });

// Format command
program
  .command('format')
  .description('Format alignment to different output formats')
  .requiredOption('-c, --class <type>', 'Formatter class: al, txt, tmx, presentation, info')
  .option('-l, --languages <langs>', 'Source and target language (comma-separated, for tmx)')
  .option('-w, --width <number>', 'Output width (for presentation)', '79')
  .option('-o, --output <file>', 'Output file (or stdout if not specified)')
  .option('--source-output <file>', 'Source output file (for txt format)')
  .option('--target-output <file>', 'Target output file (for txt format)')
  .action((options: {
    class: string;
    languages?: string;
    width: string;
    output?: string;
    sourceOutput?: string;
    targetOutput?: string;
  }) => {
    // Read from stdin
    const input = fs.readFileSync(0, 'utf-8');
    const parser = new AlParser(input);
    const alignmentList = parser.parse();

    let output: string;

    if (options.class === 'al') {
      const formatter = new AlFormatter();
      output = formatter.format(alignmentList);
    } else if (options.class === 'txt') {
      const formatter = new PlaintextFormatter();
      const result = formatter.formatSeparate(alignmentList);
      if (options.sourceOutput && options.targetOutput) {
        fs.writeFileSync(options.sourceOutput, result.source);
        fs.writeFileSync(options.targetOutput, result.target);
        return;
      } else {
        output = result.source + '\n---\n' + result.target;
      }
    } else if (options.class === 'tmx') {
      if (!options.languages) {
        console.error('TMX formatter requires --languages option');
        process.exit(1);
      }
      const langs = options.languages.split(',');
      const formatter = new TmxFormatter(langs[0]!, langs[1]!);
      output = formatter.format(alignmentList);
    } else if (options.class === 'presentation') {
      const formatter = new PresentationFormatter(parseInt(options.width));
      output = formatter.format(alignmentList);
    } else if (options.class === 'info') {
      const formatter = new InfoFormatter();
      output = formatter.format(alignmentList);
    } else {
      console.error(`Unknown formatter class: ${options.class}`);
      process.exit(1);
    }

    if (options.output) {
      fs.writeFileSync(options.output, output);
    } else {
      console.log(output);
    }
  });

// Macro command
program
  .command('macro')
  .description('Apply alignment macro (complete alignment algorithm)')
  .requiredOption('-c, --class <type>', 'Macro class: galechurch, poisson, moore')
  .action((options: { class: string }) => {
    // Read from stdin
    const input = fs.readFileSync(0, 'utf-8');
    const parser = new AlParser(input);
    let alignmentList = parser.parse();

    let filter: Filter;

    if (options.class === 'galechurch') {
      filter = new GaleAndChurchMacro();
    } else if (options.class === 'poisson') {
      filter = new PoissonMacro();
    } else if (options.class === 'moore') {
      filter = new MooreMacro();
    } else {
      console.error(`Unknown macro class: ${options.class}`);
      process.exit(1);
    }

    alignmentList = filter.apply(alignmentList);

    const formatter = new AlFormatter();
    console.log(formatter.format(alignmentList));
  });

// Modify command
program
  .command('modify')
  .description('Modify alignment segments (split, merge, clean)')
  .requiredOption('-c, --class <type>', 'Modify class: split, merge, trim, lowercase')
  .option('-a, --algorithm <alg>', 'Algorithm for split: sentence, word, paragraph')
  .option('-s, --separator <sep>', 'Separator for merge', ' ')
  .option('--source', 'Apply only to source segments')
  .option('--target', 'Apply only to target segments')
  .action((options: {
    class: string;
    algorithm?: string;
    separator?: string;
    source?: boolean;
    target?: boolean;
  }) => {
    // Read from stdin
    const input = fs.readFileSync(0, 'utf-8');
    const parser = new AlParser(input);
    let alignmentList = parser.parse();

    let algorithm: any;

    if (options.class === 'split') {
      if (options.algorithm === 'sentence') {
        algorithm = new SentenceSplitAlgorithm();
      } else if (options.algorithm === 'word') {
        algorithm = new WordSplitAlgorithm();
      } else if (options.algorithm === 'paragraph') {
        algorithm = new ParagraphSplitAlgorithm();
      } else {
        algorithm = new SentenceSplitAlgorithm();
      }
    } else if (options.class === 'merge') {
      algorithm = new SeparatorMergeAlgorithm(options.separator || ' ');
    } else if (options.class === 'trim') {
      algorithm = new TrimCleanAlgorithm();
    } else if (options.class === 'lowercase') {
      algorithm = new LowercaseCleanAlgorithm();
    } else {
      console.error(`Unknown modify class: ${options.class}`);
      process.exit(1);
    }

    // Apply to both source and target unless specified
    const applyToSource = options.source || (!options.source && !options.target);
    const applyToTarget = options.target || (!options.source && !options.target);

    const nullAlgorithm = { modify: (list: string[]) => list };
    const sourceAlgorithm = applyToSource ? algorithm : nullAlgorithm;
    const targetAlgorithm = applyToTarget ? algorithm : nullAlgorithm;

    const filter = new Modifier(sourceAlgorithm, targetAlgorithm);
    alignmentList = filter.apply(alignmentList);

    const formatter = new AlFormatter();
    console.log(formatter.format(alignmentList));
  });

// Select command
program
  .command('select')
  .description('Select/filter alignments')
  .requiredOption('-c, --class <type>', 'Selector class: onetoone, fraction, probability')
  .option('-f, --fraction <number>', 'Fraction to keep (for fraction selector)', '0.8')
  .option('-p, --probability <number>', 'Minimum probability (for probability selector)', '0.5')
  .action((options: {
    class: string;
    fraction: string;
    probability: string;
  }) => {
    // Read from stdin
    const input = fs.readFileSync(0, 'utf-8');
    const parser = new AlParser(input);
    let alignmentList = parser.parse();

    let filter: Filter;

    if (options.class === 'onetoone') {
      filter = new OneToOneSelector();
    } else if (options.class === 'fraction') {
      filter = new FractionSelector(parseFloat(options.fraction));
    } else if (options.class === 'probability') {
      filter = new ProbabilitySelector(parseFloat(options.probability));
    } else {
      console.error(`Unknown selector class: ${options.class}`);
      process.exit(1);
    }

    alignmentList = filter.apply(alignmentList);

    const formatter = new AlFormatter();
    console.log(formatter.format(alignmentList));
  });

// Align command (convenience command combining parse + macro)
program
  .command('align')
  .description('Align source and target files (convenience command)')
  .requiredOption('-s, --source <file>', 'Source text file')
  .requiredOption('-t, --target <file>', 'Target text file')
  .option('-a, --algorithm <alg>', 'Alignment algorithm: galechurch, poisson, moore', 'moore')
  .option('-o, --output <file>', 'Output file (or stdout)')
  .option('-f, --format <fmt>', 'Output format: al, txt, tmx, presentation, info', 'al')
  .option('-l, --languages <langs>', 'Languages for TMX output (comma-separated)')
  .action((options: {
    source: string;
    target: string;
    algorithm: string;
    output?: string;
    format: string;
    languages?: string;
  }) => {
    // Parse input files
    const sourceContent = fs.readFileSync(options.source, 'utf-8');
    const targetContent = fs.readFileSync(options.target, 'utf-8');

    // Create initial alignment with full text
    const parser = new PlaintextParser(sourceContent, targetContent);
    let alignmentList = parser.parse();

    // Split into sentences
    const sentenceSplitAlgorithm = new SentenceSplitAlgorithm();
    const splitModifier = new Modifier(sentenceSplitAlgorithm, sentenceSplitAlgorithm);
    alignmentList = splitModifier.apply(alignmentList);

    // Apply alignment algorithm
    let filter: Filter;
    if (options.algorithm === 'galechurch') {
      filter = new GaleAndChurchMacro();
    } else if (options.algorithm === 'poisson') {
      filter = new PoissonMacro();
    } else if (options.algorithm === 'moore') {
      filter = new MooreMacro();
    } else {
      console.error(`Unknown algorithm: ${options.algorithm}`);
      process.exit(1);
    }

    alignmentList = filter.apply(alignmentList);

    // Format output
    let output: string;
    if (options.format === 'al') {
      const formatter = new AlFormatter();
      output = formatter.format(alignmentList);
    } else if (options.format === 'txt') {
      const formatter = new PlaintextFormatter();
      const result = formatter.formatSeparate(alignmentList);
      output = result.source + '\n---\n' + result.target;
    } else if (options.format === 'tmx') {
      if (!options.languages) {
        console.error('TMX format requires --languages option');
        process.exit(1);
      }
      const langs = options.languages.split(',');
      const formatter = new TmxFormatter(langs[0]!, langs[1]!);
      output = formatter.format(alignmentList);
    } else if (options.format === 'presentation') {
      const formatter = new PresentationFormatter();
      output = formatter.format(alignmentList);
    } else if (options.format === 'info') {
      const formatter = new InfoFormatter();
      output = formatter.format(alignmentList);
    } else {
      console.error(`Unknown format: ${options.format}`);
      process.exit(1);
    }

    if (options.output) {
      fs.writeFileSync(options.output, output);
    } else {
      console.log(output);
    }
  });

program.parse();

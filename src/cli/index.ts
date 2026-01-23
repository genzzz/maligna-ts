#!/usr/bin/env node

import { Command } from 'commander';
import { parseCommand } from './commands/parse.js';
import { formatCommand } from './commands/format.js';
import { alignCommand } from './commands/align.js';
import { modifyCommand } from './commands/modify.js';
import { selectCommand } from './commands/select.js';
import { macroCommand } from './commands/macro.js';
import { compareCommand } from './commands/compare.js';

const VERSION = '3.0.0';

const program = new Command();

program
  .name('maligna')
  .description('Sentence alignment tool for bilingual corpora')
  .version(VERSION);

// Parse command
program
  .command('parse')
  .description('Parse input files to native .al format')
  .option('-c, --codec <codec>', 'Input codec (txt, tmx)', 'txt')
  .option('--source-lang <lang>', 'Source language for TMX')
  .option('--target-lang <lang>', 'Target language for TMX')
  .argument('<sourceFile>', 'Source file')
  .argument('<targetFile>', 'Target file')
  .action((sourceFile, targetFile, options) => {
    parseCommand(sourceFile, targetFile, options);
  });

// Format command
program
  .command('format')
  .description('Format .al input to output format')
  .option('-c, --codec <codec>', 'Output codec (txt, tmx, al, html, presentation)', 'txt')
  .option('--source-lang <lang>', 'Source language for TMX', 'en')
  .option('--target-lang <lang>', 'Target language for TMX', 'pl')
  .argument('[sourceOutput]', 'Source output file (for txt)')
  .argument('[targetOutput]', 'Target output file (for txt)')
  .action((sourceOutput, targetOutput, options) => {
    formatCommand(sourceOutput, targetOutput, options);
  });

// Align command
program
  .command('align')
  .description('Align segments using specified algorithm')
  .option('-c, --calculator <calc>', 'Calculator type (viterbi)', 'viterbi')
  .option('-a, --algorithm <algo>', 'Algorithm type (poisson, translation)', 'poisson')
  .option('-n, --normalize <norm>', 'Normalization (word, char)', 'word')
  .option('-t, --training <file>', 'Training alignment file for translation algorithm')
  .action((options) => {
    alignCommand(options);
  });

// Modify command
program
  .command('modify')
  .description('Modify segments')
  .option('-c, --command <cmd>', 'Modification command (split-sentence, split-paragraph, trim, merge)', 'trim')
  .action((options) => {
    modifyCommand(options);
  });

// Select command
program
  .command('select')
  .description('Select alignments based on criteria')
  .option('-c, --command <cmd>', 'Selection command (one-to-one, fraction, probability)', 'one-to-one')
  .option('-f, --fraction <value>', 'Fraction to keep (for fraction command)', '0.85')
  .option('-p, --probability <value>', 'Maximum score (for probability command)', '10')
  .action((options) => {
    selectCommand(options);
  });

// Macro command
program
  .command('macro')
  .description('Execute macro alignment operations')
  .option('-c, --command <cmd>', 'Macro command (poisson, moore)', 'poisson')
  .action((options) => {
    macroCommand(options);
  });

// Compare command
program
  .command('compare')
  .description('Compare two alignment files')
  .argument('<file1>', 'First alignment file')
  .argument('<file2>', 'Second alignment file')
  .action((file1, file2) => {
    compareCommand(file1, file2);
  });

program.parse();

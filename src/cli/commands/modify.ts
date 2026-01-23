import * as readline from 'readline';
import { AlParser } from '../../parser/AlParser.js';
import { AlFormatter } from '../../formatter/AlFormatter.js';
import { Filter } from '../../filter/Filter.js';
import { Modifier } from '../../filter/modifier/Modifier.js';
import {
  SentenceSplitAlgorithm,
  ParagraphSplitAlgorithm,
} from '../../filter/modifier/SplitAlgorithm.js';
import { MergeAllAlgorithm } from '../../filter/modifier/MergeAlgorithm.js';
import { TrimCleanAlgorithm } from '../../filter/modifier/CleanAlgorithm.js';

interface ModifyOptions {
  command: string;
}

export function modifyCommand(options: ModifyOptions): void {
  const lines: string[] = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line) => {
    lines.push(line);
  });

  rl.on('close', () => {
    const input = lines.join('\n');
    processModify(input, options);
  });
}

function processModify(input: string, options: ModifyOptions): void {
  const parser = new AlParser(input);
  const alignments = parser.parse();

  let filter: Filter;

  switch (options.command) {
    case 'split-sentence':
      filter = new Modifier(new SentenceSplitAlgorithm());
      break;
    case 'split-paragraph':
      filter = new Modifier(new ParagraphSplitAlgorithm());
      break;
    case 'trim':
      filter = new Modifier(new TrimCleanAlgorithm());
      break;
    case 'merge':
      filter = new Modifier(new MergeAllAlgorithm());
      break;
    default:
      console.error(`Unknown modify command: ${options.command}`);
      process.exit(1);
  }

  const result = filter.apply(alignments);
  const formatter = new AlFormatter();
  console.log(formatter.format(result));
}

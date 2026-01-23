import * as readline from 'readline';
import { AlParser } from '../../parser/AlParser.js';
import { AlFormatter } from '../../formatter/AlFormatter.js';
import { Filter } from '../../filter/Filter.js';
import { OneToOneSelector } from '../../filter/selector/OneToOneSelector.js';
import { FractionSelector } from '../../filter/selector/FractionSelector.js';
import { ProbabilitySelector } from '../../filter/selector/ProbabilitySelector.js';

interface SelectOptions {
  command: string;
  fraction: string;
  probability: string;
}

export function selectCommand(options: SelectOptions): void {
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
    processSelect(input, options);
  });
}

function processSelect(input: string, options: SelectOptions): void {
  const parser = new AlParser(input);
  const alignments = parser.parse();

  let filter: Filter;

  switch (options.command) {
    case 'one-to-one':
      filter = new OneToOneSelector();
      break;
    case 'fraction':
      filter = new FractionSelector(parseFloat(options.fraction));
      break;
    case 'probability':
      filter = new ProbabilitySelector(parseFloat(options.probability));
      break;
    default:
      console.error(`Unknown select command: ${options.command}`);
      process.exit(1);
  }

  const result = filter.apply(alignments);
  const formatter = new AlFormatter();
  console.log(formatter.format(result));
}

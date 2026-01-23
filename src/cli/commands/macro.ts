import * as readline from 'readline';
import { AlParser } from '../../parser/AlParser.js';
import { AlFormatter } from '../../formatter/AlFormatter.js';
import { Filter } from '../../filter/Filter.js';
import { PoissonMacro } from '../../filter/macro/PoissonMacro.js';
import { MooreMacro } from '../../filter/macro/MooreMacro.js';

interface MacroOptions {
  command: string;
}

export function macroCommand(options: MacroOptions): void {
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
    processMacro(input, options);
  });
}

function processMacro(input: string, options: MacroOptions): void {
  const parser = new AlParser(input);
  const alignments = parser.parse();

  let filter: Filter;

  switch (options.command) {
    case 'poisson':
      filter = new PoissonMacro();
      break;
    case 'moore':
      filter = new MooreMacro();
      break;
    default:
      console.error(`Unknown macro command: ${options.command}`);
      process.exit(1);
  }

  const result = filter.apply(alignments);
  const formatter = new AlFormatter();
  console.log(formatter.format(result));
}

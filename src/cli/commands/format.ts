import * as fs from 'fs';
import * as readline from 'readline';
import { AlParser } from '../../parser/AlParser.js';
import { AlFormatter } from '../../formatter/AlFormatter.js';
import {
  PlaintextFormatter,
} from '../../formatter/PlaintextFormatter.js';
import { TmxFormatter } from '../../formatter/TmxFormatter.js';
import { HtmlFormatter } from '../../formatter/HtmlFormatter.js';
import { PresentationFormatter } from '../../formatter/PresentationFormatter.js';

interface FormatOptions {
  codec: string;
  sourceLang: string;
  targetLang: string;
}

export function formatCommand(
  sourceOutput: string | undefined,
  targetOutput: string | undefined,
  options: FormatOptions
): void {
  // Read from stdin
  let input = '';
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const lines: string[] = [];
  rl.on('line', (line) => {
    lines.push(line);
  });

  rl.on('close', () => {
    input = lines.join('\n');
    processFormat(input, sourceOutput, targetOutput, options);
  });
}

function processFormat(
  input: string,
  sourceOutput: string | undefined,
  targetOutput: string | undefined,
  options: FormatOptions
): void {
  const parser = new AlParser(input);
  const alignments = parser.parse();

  if (options.codec === 'txt') {
    const formatter = new PlaintextFormatter();
    const result = formatter.formatSeparate(alignments);

    if (sourceOutput && targetOutput) {
      fs.writeFileSync(sourceOutput, result.source);
      fs.writeFileSync(targetOutput, result.target);
      console.error(`Written ${alignments.length} alignments`);
    } else {
      console.log(result.source);
      console.log('---');
      console.log(result.target);
    }
  } else if (options.codec === 'tmx') {
    const formatter = new TmxFormatter(options.sourceLang, options.targetLang);
    console.log(formatter.format(alignments));
  } else if (options.codec === 'html') {
    const formatter = new HtmlFormatter();
    console.log(formatter.format(alignments));
  } else if (options.codec === 'presentation') {
    const formatter = new PresentationFormatter();
    console.log(formatter.format(alignments));
  } else if (options.codec === 'al') {
    const formatter = new AlFormatter();
    console.log(formatter.format(alignments));
  } else {
    console.error(`Unknown codec: ${options.codec}`);
    process.exit(1);
  }
}

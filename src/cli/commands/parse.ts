import * as fs from 'fs';
import { PlaintextParser } from '../../parser/PlaintextParser.js';
import { TmxParser } from '../../parser/TmxParser.js';
import { AlFormatter } from '../../formatter/AlFormatter.js';

interface ParseOptions {
  codec: string;
  sourceLang?: string;
  targetLang?: string;
}

export function parseCommand(
  sourceFile: string,
  targetFile: string,
  options: ParseOptions
): void {
  const formatter = new AlFormatter();

  let alignments;

  if (options.codec === 'txt') {
    const sourceText = fs.readFileSync(sourceFile, 'utf-8');
    const targetText = fs.readFileSync(targetFile, 'utf-8');
    const parser = new PlaintextParser(sourceText, targetText);
    alignments = parser.parse();
  } else if (options.codec === 'tmx') {
    const tmxContent = fs.readFileSync(sourceFile, 'utf-8');
    const parser = new TmxParser(
      tmxContent,
      options.sourceLang,
      options.targetLang
    );
    alignments = parser.parse();
  } else {
    console.error(`Unknown codec: ${options.codec}`);
    process.exit(1);
  }

  const output = formatter.format(alignments);
  console.log(output);
}

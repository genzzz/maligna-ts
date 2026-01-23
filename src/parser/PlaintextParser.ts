import { Alignment } from '../core/Alignment.js';
import { Parser } from './Parser.js';

/**
 * Parser for plaintext files.
 * Takes source and target texts as input and creates a single alignment
 * containing all text.
 */
export class PlaintextParser implements Parser {
  private readonly sourceText: string;
  private readonly targetText: string;

  constructor(sourceText: string, targetText: string) {
    this.sourceText = sourceText;
    this.targetText = targetText;
  }

  parse(): Alignment[] {
    const alignment = new Alignment([this.sourceText], [this.targetText]);
    return [alignment];
  }
}

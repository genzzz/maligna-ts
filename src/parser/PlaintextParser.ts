import { Parser } from './Parser';
import { Alignment } from '../coretypes/Alignment';

/**
 * Plaintext parser — reads two text files and creates a single alignment
 * where all source text is one segment and all target text is one segment.
 */
export class PlaintextParser implements Parser {
  private sourceContent: string;
  private targetContent: string;

  constructor(sourceContent: string, targetContent: string) {
    this.sourceContent = sourceContent;
    this.targetContent = targetContent;
  }

  parse(): Alignment[] {
    return [new Alignment([this.sourceContent], [this.targetContent])];
  }
}

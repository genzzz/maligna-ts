import { Alignment } from '../core/Alignment.js';
import { Formatter } from './Formatter.js';

/**
 * Result of plaintext formatting (two separate files).
 */
export interface PlaintextResult {
  source: string;
  target: string;
}

/**
 * Formatter for plaintext output.
 * Creates two outputs - one for source and one for target.
 * Each line corresponds to one alignment.
 */
export class PlaintextFormatter implements Formatter {
  private readonly separator: string;

  constructor(separator: string = ' ') {
    this.separator = separator;
  }

  format(alignmentList: Alignment[]): string {
    // Returns combined output with source and target separated by tabs
    const result = this.formatSeparate(alignmentList);
    return result.source + '\n---\n' + result.target;
  }

  /**
   * Formats to separate source and target strings.
   */
  formatSeparate(alignmentList: Alignment[]): PlaintextResult {
    const sourceLines: string[] = [];
    const targetLines: string[] = [];

    for (const alignment of alignmentList) {
      const sourceLine = alignment
        .getSourceSegmentList()
        .join(this.separator);
      const targetLine = alignment
        .getTargetSegmentList()
        .join(this.separator);
      sourceLines.push(sourceLine);
      targetLines.push(targetLine);
    }

    return {
      source: sourceLines.join('\n'),
      target: targetLines.join('\n'),
    };
  }
}

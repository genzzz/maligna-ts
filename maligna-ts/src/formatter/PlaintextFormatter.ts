import { Alignment } from '../coretypes/index.js';
import { Formatter } from './Formatter.js';
import { merge } from '../util/index.js';

/**
 * Represents a formatter writing to separate source and target plaintext files.
 * 
 * In each line of each file all given alignment segments are written.
 * Subsequent lines in source and target files correspond to each other, number
 * of lines is equal in files. If alignment consists of more than one segment,
 * they are merged and space is inserted between them.
 */
export class PlaintextFormatter implements Formatter {
  /**
   * Formats alignment list and returns both source and target content.
   * @param alignmentList input alignment list
   * @returns formatted output with source and target separated by a special marker
   */
  format(alignmentList: Alignment[]): string {
    const result = this.formatSeparate(alignmentList);
    return result.source + '\n---SOURCE_TARGET_SEPARATOR---\n' + result.target;
  }

  /**
   * Formats alignment list and returns separate source and target content.
   * @param alignmentList input alignment list
   * @returns object with source and target strings
   */
  formatSeparate(alignmentList: Alignment[]): { source: string; target: string } {
    const sourceLines: string[] = [];
    const targetLines: string[] = [];

    for (const alignment of alignmentList) {
      sourceLines.push(this.formatSegmentList(alignment.sourceSegmentList));
      targetLines.push(this.formatSegmentList(alignment.targetSegmentList));
    }

    return {
      source: sourceLines.join('\n'),
      target: targetLines.join('\n'),
    };
  }

  /**
   * Merges segments and replaces end-of-line characters with spaces to make
   * sure resulting files have the same number of lines.
   */
  private formatSegmentList(segmentList: readonly string[]): string {
    const segment = merge([...segmentList]);
    return segment.replace(/\n/g, ' ');
  }
}

import { Formatter } from './Formatter';
import { Alignment } from '../coretypes/Alignment';

/**
 * Plaintext formatter — outputs source and target in separate sections,
 * one segment per line, with empty lines between alignments.
 *
 * Returns an object with sourceText and targetText strings.
 * When used with a writer, writes source to first file and target to second.
 */
export class PlaintextFormatter implements Formatter {
  format(alignmentList: Alignment[]): string {
    const lines: string[] = [];
    for (const al of alignmentList) {
      const sourceLine = al.sourceSegmentList.join(' ');
      const targetLine = al.targetSegmentList.join(' ');
      lines.push(`${sourceLine}\t${targetLine}`);
    }
    return lines.join('\n');
  }

  /**
   * Formats as two separate text outputs.
   */
  formatSeparate(alignmentList: Alignment[]): { source: string; target: string } {
    const sourceLines: string[] = [];
    const targetLines: string[] = [];
    for (const al of alignmentList) {
      sourceLines.push(al.sourceSegmentList.join(' '));
      targetLines.push(al.targetSegmentList.join(' '));
    }
    return {
      source: sourceLines.join('\n') + '\n',
      target: targetLines.join('\n') + '\n',
    };
  }
}

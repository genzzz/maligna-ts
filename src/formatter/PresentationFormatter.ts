import { Alignment } from '../core/Alignment.js';
import { Formatter } from './Formatter.js';
import { toProbability } from '../util/math.js';

/**
 * Formatter that presents alignment in a human-readable manner.
 */
export class PresentationFormatter implements Formatter {
  format(alignmentList: Alignment[]): string {
    const lines: string[] = [];
    lines.push('='.repeat(80));
    lines.push('ALIGNMENT RESULTS');
    lines.push('='.repeat(80));
    lines.push('');

    let index = 1;
    for (const alignment of alignmentList) {
      const category = alignment.getCategory();
      const probability = toProbability(alignment.score);

      lines.push(`[${index}] ${category.toString()}`);
      lines.push(`    Score: ${alignment.score.toFixed(4)} (prob: ${probability.toFixed(6)})`);
      lines.push('    Source:');
      for (const segment of alignment.getSourceSegmentList()) {
        lines.push(`      > ${segment}`);
      }
      lines.push('    Target:');
      for (const segment of alignment.getTargetSegmentList()) {
        lines.push(`      > ${segment}`);
      }
      lines.push('-'.repeat(80));

      index++;
    }

    lines.push('');
    lines.push(`Total alignments: ${alignmentList.length}`);

    return lines.join('\n');
  }
}

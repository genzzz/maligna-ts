import { Formatter } from './Formatter';
import { Alignment } from '../coretypes/Alignment';

/**
 * Info formatter — outputs category statistics.
 */
export class InfoFormatter implements Formatter {
  format(alignmentList: Alignment[]): string {
    const categoryCount = new Map<string, number>();
    let totalAlignments = 0;

    for (const al of alignmentList) {
      const key = al.getCategory().toString();
      categoryCount.set(key, (categoryCount.get(key) || 0) + 1);
      totalAlignments++;
    }

    const lines: string[] = [];
    lines.push(`Total alignments: ${totalAlignments}`);
    lines.push('');
    lines.push('Category distribution:');

    const sortedEntries = [...categoryCount.entries()].sort(
      (a, b) => b[1] - a[1]
    );
    for (const [category, count] of sortedEntries) {
      const percentage = ((count / totalAlignments) * 100).toFixed(1);
      lines.push(`  ${category}: ${count} (${percentage}%)`);
    }

    return lines.join('\n');
  }
}

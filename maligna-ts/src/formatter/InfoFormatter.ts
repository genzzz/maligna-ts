import { Alignment } from '../coretypes/index.js';
import { Category } from '../coretypes/index.js';
import { Formatter } from './Formatter.js';

/**
 * Represents formatter displaying info and statistics of the whole alignment.
 * 
 * The statistics include total number of alignments and number of alignments
 * per category.
 */
export class InfoFormatter implements Formatter {
  /**
   * Formats the result with alignment statistics.
   */
  format(alignmentList: Alignment[]): string {
    const alignmentCount = alignmentList.length;
    const categoryMap = new Map<string, { category: Category; count: number }>();

    for (const alignment of alignmentList) {
      const category = alignment.category;
      const key = category.toKey();
      const existing = categoryMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(key, { category, count: 1 });
      }
    }

    // Sort categories
    const sortedEntries = Array.from(categoryMap.values()).sort((a, b) => {
      return this.compareCategories(a.category, b.category);
    });

    const lines: string[] = [];
    for (const entry of sortedEntries) {
      lines.push(`${entry.category.toString()}\t${entry.count}`);
    }
    lines.push(`Total\t${alignmentCount}`);

    return lines.join('\n');
  }

  /**
   * Orders categories in the following ascending order. Example:
   * (0-1), (1-0), (1-1), (1-2), (2-1), (2-2), ...
   */
  private compareCategories(left: Category, right: Category): number {
    let result = this.getMinimumSegmentCount(left) - this.getMinimumSegmentCount(right);
    if (result === 0) {
      result = this.getMaximumSegmentCount(left) - this.getMaximumSegmentCount(right);
      if (result === 0) {
        result = left.sourceSegmentCount - right.sourceSegmentCount;
      }
    }
    return result;
  }

  private getMinimumSegmentCount(category: Category): number {
    return Math.min(category.sourceSegmentCount, category.targetSegmentCount);
  }

  private getMaximumSegmentCount(category: Category): number {
    return Math.max(category.sourceSegmentCount, category.targetSegmentCount);
  }
}

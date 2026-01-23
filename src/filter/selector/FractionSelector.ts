import { Alignment } from '../../core/Alignment.js';
import { Filter } from '../Filter.js';

/**
 * Selector that keeps only the most probable fraction of alignments.
 */
export class FractionSelector implements Filter {
  private readonly fraction: number;

  /**
   * Creates filter.
   * @param fraction fraction to keep, [0, 1]
   */
  constructor(fraction: number) {
    if (fraction < 0 || fraction > 1) {
      throw new Error('Fraction must be between 0 and 1');
    }
    this.fraction = fraction;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    const threshold = this.calculateThreshold(alignmentList);
    return alignmentList.filter((alignment) => alignment.score <= threshold);
  }

  private calculateThreshold(alignmentList: Alignment[]): number {
    const scores = alignmentList.map((a) => a.score).sort((a, b) => a - b);

    const firstFilteredIndex = this.fraction * scores.length - 0.5;

    if (firstFilteredIndex < 0) {
      return -Infinity;
    }

    return scores[Math.floor(firstFilteredIndex)];
  }
}

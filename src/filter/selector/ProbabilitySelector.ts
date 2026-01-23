import { Alignment } from '../../core/Alignment.js';
import { Filter } from '../Filter.js';

/**
 * Selector that keeps alignments with probability above a threshold.
 */
export class ProbabilitySelector implements Filter {
  private readonly maxScore: number;

  /**
   * Creates filter.
   * @param maxScore maximum score (minimum probability) to keep
   */
  constructor(maxScore: number) {
    this.maxScore = maxScore;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    return alignmentList.filter((alignment) => alignment.score <= this.maxScore);
  }
}

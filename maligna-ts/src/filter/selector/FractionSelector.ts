import { Alignment } from '../../coretypes/index.js';
import { Filter } from '../Filter.js';

/**
 * Represents a filter that selects given fraction of most probable
 * alignments.
 */
export class FractionSelector implements Filter {
  private fraction: number;

  /**
   * Creates filter.
   * @param fraction fraction that will be left after filtering, [0,1]
   */
  constructor(fraction: number) {
    if (fraction < 0 || fraction > 1) {
      throw new Error(`Fraction must be between 0 and 1, got ${fraction}`);
    }
    this.fraction = fraction;
  }

  /**
   * Selects most probable alignments from input list and leaves only
   * given fraction of the best ones. For example if list has 100 alignments
   * and the fraction was set to 0.8, then the resulting list will have
   * 80 alignments with highest probability (lowest score).
   * Does not change alignments order.
   * Resulting list can have few more elements if they have equal score.
   * 
   * @param alignmentList input alignment list
   * @returns filtered alignment list
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const threshold = this.calculateThreshold(alignmentList);
    const filteredAlignmentList: Alignment[] = [];
    for (const alignment of alignmentList) {
      if (alignment.score <= threshold) {
        filteredAlignmentList.push(alignment);
      }
    }
    return filteredAlignmentList;
  }

  private calculateThreshold(alignmentList: Alignment[]): number {
    const scoreArray = alignmentList.map(a => a.score);
    scoreArray.sort((a, b) => a - b);
    
    const firstFiltered = this.fraction * scoreArray.length - 0.5;
    let threshold: number;
    
    if (firstFiltered < 0 || scoreArray.length === 0) {
      threshold = Number.NEGATIVE_INFINITY;
    } else {
      threshold = scoreArray[Math.floor(firstFiltered)]!;
    }
    
    return threshold;
  }
}

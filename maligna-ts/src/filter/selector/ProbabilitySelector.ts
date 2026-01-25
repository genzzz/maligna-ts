import { Alignment } from '../../coretypes/index.js';
import { Filter } from '../Filter.js';
import { toScore } from '../../util/index.js';

/**
 * Selects alignments with probability equal or greater than given threshold.
 */
export class ProbabilitySelector implements Filter {
  private scoreThreshold: number;

  /**
   * Creates selector.
   * @param probabilityThreshold Minimum accepted alignment probability.
   *        From range [0,1].
   */
  constructor(probabilityThreshold: number) {
    if (probabilityThreshold < 0 || probabilityThreshold > 1) {
      throw new Error(`Probability threshold must be between 0 and 1, got ${probabilityThreshold}`);
    }
    this.scoreThreshold = toScore(probabilityThreshold);
  }

  /**
   * Selects alignments with probability equal or greater than threshold.
   * @param alignmentList input alignment list
   * @returns list containing selected alignments
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const selectedAlignmentList: Alignment[] = [];
    for (const alignment of alignmentList) {
      if (alignment.score <= this.scoreThreshold) {
        selectedAlignmentList.push(alignment);
      }
    }
    return selectedAlignmentList;
  }
}

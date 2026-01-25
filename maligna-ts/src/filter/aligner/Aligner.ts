import { Alignment } from '../../coretypes/index.js';
import { Filter } from '../Filter.js';
import { AlignAlgorithm } from './align/AlignAlgorithm.js';

/**
 * Represents aligner - for each alignment on input list aligns source segments
 * with target segments and appends obtained list of alignments to the result.
 * This implies that resulting list can have more alignments than input list
 * but cannot have less. Does not change alignment contents.
 */
export class Aligner implements Filter {
  private algorithm: AlignAlgorithm;

  constructor(algorithm: AlignAlgorithm) {
    this.algorithm = algorithm;
  }

  /**
   * For each alignment on input list aligns source segments with target
   * segments, and appends the obtained alignment list to the result.
   * @throws AlignmentImpossibleException when it is not possible to align texts
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const newAlignmentList: Alignment[] = [];
    for (const alignment of alignmentList) {
      const currentAlignmentList = this.algorithm.align(
        [...alignment.sourceSegmentList],
        [...alignment.targetSegmentList]
      );
      newAlignmentList.push(...currentAlignmentList);
    }
    return newAlignmentList;
  }
}

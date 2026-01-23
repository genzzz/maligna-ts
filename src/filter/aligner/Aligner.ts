import { Alignment } from '../../core/Alignment.js';
import { Filter } from '../Filter.js';
import { AlignAlgorithm } from './AlignAlgorithm.js';

/**
 * Represents aligner - for each alignment on input list aligns source segments
 * with target segments and appends obtained list of alignments to the result.
 * This implies that resulting list can have more alignments than input list
 * but cannot have less. Does not change alignment contents.
 */
export class Aligner implements Filter {
  private readonly algorithm: AlignAlgorithm;

  constructor(algorithm: AlignAlgorithm) {
    this.algorithm = algorithm;
  }

  /**
   * For each alignment on input list aligns source segments with target
   * segments, and appends the obtained alignment list to the result.
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const newAlignmentList: Alignment[] = [];
    for (const alignment of alignmentList) {
      const currentAlignmentList = this.algorithm.align(
        alignment.getSourceSegmentList(),
        alignment.getTargetSegmentList()
      );
      newAlignmentList.push(...currentAlignmentList);
    }
    return newAlignmentList;
  }
}

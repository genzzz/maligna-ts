import { Alignment } from '../../core/Alignment.js';

/**
 * Represents alignment algorithm.
 */
export interface AlignAlgorithm {
  /**
   * Aligns source segment list with target segment list and returns a
   * list of alignments. All segments on the input list will be
   * present in resulting alignment in the same order as they were present
   * on input lists.
   */
  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[];
}

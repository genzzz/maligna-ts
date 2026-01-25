import { Alignment } from '../../../coretypes/Alignment.js';

/**
 * Represents alignment algorithm.
 */
export interface AlignAlgorithm {
  /**
   * Aligns source segment list with target segment list and returns a
   * list of alignments. All segments on the input list will be
   * present in resulting alignment in the same order as they were present
   * on input lists.
   * Alignments can be, one-to-zero, one-to-one,
   * many-to-zero, many-to-one, many-to-many.
   * If both lists are empty returns empty list. If one of the lists is
   * empty returns only many-to-zero alignments (all-to-zero if possible).
   *
   * @param sourceSegmentList source segment list
   * @param targetSegmentList target segment list
   * @returns alignment list containing all segments.
   */
  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[];
}

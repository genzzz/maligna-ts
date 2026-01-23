/**
 * Represents method of calculating probability of an alignment of given
 * source segments to given target segments.
 * It's the heart of alignment algorithm.
 *
 * The actual implementation can calculate the result using just segment
 * lengths (length package) or contents of the segments (content package).
 */
export interface Calculator {
  /**
   * Calculates score (equal to -ln(probability)) of alignment of given
   * source segments to given target segments.
   *
   * @param sourceSegmentList source segment list
   * @param targetSegmentList target segment list
   * @returns result (-ln(probability)) of the alignment, >= 0
   */
  calculateScore(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): number;
}

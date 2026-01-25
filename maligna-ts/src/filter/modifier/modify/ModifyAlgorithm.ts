/**
 * Represents modify algorithm that transforms segment lists.
 */
export interface ModifyAlgorithm {
  /**
   * Modifies a segment list.
   * @param segmentList source segment list
   * @returns output segment list
   */
  modify(segmentList: readonly string[]): string[];
}

/**
 * Represents modify algorithm that transforms a list of segments.
 */
export interface ModifyAlgorithm {
  /**
   * Modifies a segment list and returns new segment list.
   */
  modify(segmentList: readonly string[]): string[];
}

/**
 * Null modify algorithm that returns input unchanged.
 */
export class NullModifyAlgorithm implements ModifyAlgorithm {
  modify(segmentList: readonly string[]): string[] {
    return [...segmentList];
  }
}

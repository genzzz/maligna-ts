import { ModifyAlgorithm } from '../ModifyAlgorithm.js';

/**
 * Represents modify algorithm splitting single segment into a list of segments.
 */
export abstract class SplitAlgorithm implements ModifyAlgorithm {
  /**
   * Modifies a segment list by splitting each segment on the list and
   * adding the resulting list to an output list.
   * @param segmentList source segment list
   * @returns output segment list
   */
  modify(segmentList: readonly string[]): string[] {
    const newSegmentList: string[] = [];
    for (const segment of segmentList) {
      const currentSegmentList = this.split(segment);
      newSegmentList.push(...currentSegmentList);
    }
    return newSegmentList;
  }

  /**
   * Splits a segment into a list of segments.
   * @param str input segment
   * @returns resulting segment list
   */
  abstract split(str: string): string[];
}

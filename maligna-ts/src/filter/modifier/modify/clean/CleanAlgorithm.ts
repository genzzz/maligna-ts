import { ModifyAlgorithm } from '../ModifyAlgorithm.js';

/**
 * Represents modify algorithm that cleans input segment list from useless
 * segments or characters inside segments.
 */
export abstract class CleanAlgorithm implements ModifyAlgorithm {
  /**
   * Modifies each individual segment by calling clean() method.
   * Stores the results in output list, ignoring a segment when clean()
   * returns null.
   * @param segmentList source segment list
   * @returns cleaned segment list
   */
  modify(segmentList: string[]): string[] {
    const newSegmentList: string[] = [];
    for (const segment of segmentList) {
      const newSegment = this.clean(segment);
      if (newSegment !== null) {
        newSegmentList.push(newSegment);
      }
    }
    return newSegmentList;
  }

  /**
   * Modifies single individual segment. If returns null the segment is
   * removed from resulting list.
   * @param segment input segment
   * @returns modified segment or null if it should be removed from the result
   */
  abstract clean(segment: string): string | null;
}

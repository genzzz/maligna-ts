import { ModifyAlgorithm } from '../ModifyAlgorithm.js';

/**
 * Represents algorithm merging a few segments into one.
 * This operation can add extra characters between segments or modify segment
 * contents - the important characteristic of it is that it always takes
 * segment list but returns just one segment.
 */
export abstract class MergeAlgorithm implements ModifyAlgorithm {
  modify(segmentList: readonly string[]): string[] {
    return [this.merge([...segmentList])];
  }

  /**
   * Merges segments from input list into one output segment.
   * @param segmentList source segment list
   * @returns output segment
   */
  abstract merge(segmentList: string[]): string;
}

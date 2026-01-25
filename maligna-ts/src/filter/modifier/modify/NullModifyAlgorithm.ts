import { ModifyAlgorithm } from './ModifyAlgorithm.js';

/**
 * Represents modify algorithm that is not changing the input in any way.
 * Useful when we want to perform operation just on source or target
 * segments and leave the other as it is.
 * Null design pattern.
 */
export class NullModifyAlgorithm implements ModifyAlgorithm {
  /**
   * @param segmentList source segment list
   * @returns unmodified source segment list
   */
  modify(segmentList: string[]): string[] {
    return segmentList;
  }
}

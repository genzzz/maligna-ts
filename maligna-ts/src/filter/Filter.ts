import { Alignment } from '../coretypes/index.js';

/**
 * Represents alignment list filter (in a sense of UNIX filter).
 * Allows to perform any operation on alignment list (not only, like name
 * suggests, filter elements from it) - for example it can modify segment
 * contents, join or split alignments, etc.
 * 
 * Filter operation receives alignment list as a parameter and returns
 * modified alignment list. Thanks to the fact that input and output has the
 * same type filters can be connected together creating the operation pipeline.
 */
export interface Filter {
  /**
   * Performs any transformation on alignment list.
   * @param alignmentList input alignment list
   * @returns output alignment list
   */
  apply(alignmentList: Alignment[]): Alignment[];
}

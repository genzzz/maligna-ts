import { Alignment } from '../../coretypes/index.js';
import { Filter } from '../Filter.js';

/**
 * Represents the filter that selects only one to one alignments and removes
 * the rest.
 */
export class OneToOneSelector implements Filter {
  /**
   * Filters the alignment list by leaving only 1-1 alignments.
   * 
   * @param alignmentList input alignment list
   * @returns filtered alignment list
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const filteredAlignmentList: Alignment[] = [];
    for (const alignment of alignmentList) {
      if (alignment.sourceSegmentList.length === 1 &&
          alignment.targetSegmentList.length === 1) {
        filteredAlignmentList.push(alignment);
      }
    }
    return filteredAlignmentList;
  }
}

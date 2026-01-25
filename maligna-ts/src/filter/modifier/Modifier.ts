import { Alignment } from '../../coretypes/index.js';
import { Filter } from '../Filter.js';
import { ModifyAlgorithm } from './modify/ModifyAlgorithm.js';

/**
 * Represents a filter manipulating source or target segments in an
 * alignment list.
 * The modification can be for example merging segments (merge package),
 * splitting segments (split package) or changing segment contents
 * (clean package).
 * Applies separate algorithms (ModifyAlgorithm) to source
 * and target segments in each alignment on input list.
 */
export class Modifier implements Filter {
  private sourceAlgorithm: ModifyAlgorithm;
  private targetAlgorithm: ModifyAlgorithm;

  /**
   * Creates modifier using two separate source and target segment
   * modification algorithms.
   * @param sourceAlgorithm source segment modification algorithm
   * @param targetAlgorithm target segment modification algorithm
   */
  constructor(sourceAlgorithm: ModifyAlgorithm, targetAlgorithm: ModifyAlgorithm) {
    this.sourceAlgorithm = sourceAlgorithm;
    this.targetAlgorithm = targetAlgorithm;
  }

  /**
   * Iterates over input alignment list and applies source algorithm
   * to source segments and target algorithm to target segments to each
   * alignment.
   * @param alignmentList input alignment list
   * @returns list containing alignments with modified segments
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const newAlignmentList: Alignment[] = [];
    for (const alignment of alignmentList) {
      const sourceSegmentList = this.sourceAlgorithm.modify([...alignment.sourceSegmentList]);
      const targetSegmentList = this.targetAlgorithm.modify([...alignment.targetSegmentList]);
      const newAlignment = new Alignment(sourceSegmentList, targetSegmentList, alignment.score);
      newAlignmentList.push(newAlignment);
    }
    return newAlignmentList;
  }
}

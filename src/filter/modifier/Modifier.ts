import { Alignment } from '../../core/Alignment.js';
import { Filter } from '../Filter.js';
import { ModifyAlgorithm } from './ModifyAlgorithm.js';

/**
 * Represents a filter manipulating source or target segments in an
 * alignment list.
 *
 * The modification can be merging segments, splitting segments,
 * or changing segment contents.
 *
 * Applies separate algorithms to source and target segments in each alignment.
 */
export class Modifier implements Filter {
  private readonly sourceAlgorithm: ModifyAlgorithm;
  private readonly targetAlgorithm: ModifyAlgorithm;

  constructor(
    sourceAlgorithm: ModifyAlgorithm,
    targetAlgorithm?: ModifyAlgorithm
  ) {
    this.sourceAlgorithm = sourceAlgorithm;
    this.targetAlgorithm = targetAlgorithm || sourceAlgorithm;
  }

  /**
   * Iterates over input alignment list and applies source algorithm
   * to source segments and target algorithm to target segments.
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const newAlignmentList: Alignment[] = [];
    for (const alignment of alignmentList) {
      const sourceSegmentList = this.sourceAlgorithm.modify(
        alignment.getSourceSegmentList()
      );
      const targetSegmentList = this.targetAlgorithm.modify(
        alignment.getTargetSegmentList()
      );
      const newAlignment = new Alignment(
        sourceSegmentList,
        targetSegmentList,
        alignment.score
      );
      newAlignmentList.push(newAlignment);
    }
    return newAlignmentList;
  }
}

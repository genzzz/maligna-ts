import { Alignment } from '../../core/Alignment.js';
import { Filter } from '../Filter.js';

/**
 * Selector that keeps only one-to-one alignments.
 */
export class OneToOneSelector implements Filter {
  apply(alignmentList: Alignment[]): Alignment[] {
    return alignmentList.filter((alignment) => {
      return (
        alignment.getSourceSegmentList().length === 1 &&
        alignment.getTargetSegmentList().length === 1
      );
    });
  }
}

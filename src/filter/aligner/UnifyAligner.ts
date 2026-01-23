import { Alignment } from '../../core/Alignment.js';
import { Filter } from '../Filter.js';

/**
 * Unifies two alignment lists by copying segment contents from one
 * alignment list to match the alignment structure of another.
 *
 * Useful when you align a modified version of segments (e.g., with
 * rare words removed) and want to restore the original segment contents.
 */
export class UnifyAligner implements Filter {
  private readonly referenceAlignmentList: Alignment[];

  constructor(referenceAlignmentList: Alignment[]) {
    this.referenceAlignmentList = referenceAlignmentList;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    // Extract all segments from reference
    const sourceSegments: string[] = [];
    const targetSegments: string[] = [];
    for (const alignment of this.referenceAlignmentList) {
      sourceSegments.push(...alignment.getSourceSegmentList());
      targetSegments.push(...alignment.getTargetSegmentList());
    }

    // Apply alignment structure to reference segments
    const result: Alignment[] = [];
    let sourceIdx = 0;
    let targetIdx = 0;

    for (const alignment of alignmentList) {
      const sourceCount = alignment.getSourceSegmentList().length;
      const targetCount = alignment.getTargetSegmentList().length;

      const newSourceSegments = sourceSegments.slice(
        sourceIdx,
        sourceIdx + sourceCount
      );
      const newTargetSegments = targetSegments.slice(
        targetIdx,
        targetIdx + targetCount
      );

      result.push(
        new Alignment(newSourceSegments, newTargetSegments, alignment.score)
      );

      sourceIdx += sourceCount;
      targetIdx += targetCount;
    }

    return result;
  }
}

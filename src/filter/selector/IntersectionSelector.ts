import { Alignment } from '../../core/Alignment.js';
import { Filter } from '../Filter.js';

/**
 * Selector that computes intersection of alignments from two sources.
 * Keeps only alignments that appear in both lists (same source/target counts).
 */
export class IntersectionSelector implements Filter {
  private readonly referenceAlignmentList: Alignment[];

  constructor(referenceAlignmentList: Alignment[]) {
    this.referenceAlignmentList = referenceAlignmentList;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    const result: Alignment[] = [];

    // Build a map of reference alignments by position
    let sourceIdx = 0;
    let targetIdx = 0;
    const referenceMap = new Map<string, { sourceCount: number; targetCount: number }>();

    for (const ref of this.referenceAlignmentList) {
      const key = `${sourceIdx},${targetIdx}`;
      referenceMap.set(key, {
        sourceCount: ref.getSourceSegmentList().length,
        targetCount: ref.getTargetSegmentList().length,
      });
      sourceIdx += ref.getSourceSegmentList().length;
      targetIdx += ref.getTargetSegmentList().length;
    }

    // Check which alignments match
    sourceIdx = 0;
    targetIdx = 0;

    for (const alignment of alignmentList) {
      const key = `${sourceIdx},${targetIdx}`;
      const ref = referenceMap.get(key);

      if (
        ref &&
        ref.sourceCount === alignment.getSourceSegmentList().length &&
        ref.targetCount === alignment.getTargetSegmentList().length
      ) {
        result.push(alignment);
      }

      sourceIdx += alignment.getSourceSegmentList().length;
      targetIdx += alignment.getTargetSegmentList().length;
    }

    return result;
  }
}

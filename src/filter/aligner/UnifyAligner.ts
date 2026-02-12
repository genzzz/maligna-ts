import { Filter } from '../Filter';
import { Alignment } from '../../coretypes/Alignment';

/**
 * Unify aligner — re-aligns content to match a reference alignment structure.
 * Uses the reference alignment as a template: for each reference alignment,
 * takes the same number of source and target segments from the input.
 */
export class UnifyAligner implements Filter {
  private referenceAlignmentList: Alignment[];

  constructor(referenceAlignmentList: Alignment[]) {
    this.referenceAlignmentList = referenceAlignmentList;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    // Flatten all source and target segments from input
    const allSource: string[] = [];
    const allTarget: string[] = [];
    for (const al of alignmentList) {
      allSource.push(...al.sourceSegmentList);
      allTarget.push(...al.targetSegmentList);
    }

    // Re-align according to reference structure
    const result: Alignment[] = [];
    let sourceIdx = 0;
    let targetIdx = 0;

    for (const refAl of this.referenceAlignmentList) {
      const sourceCount = refAl.sourceSegmentList.length;
      const targetCount = refAl.targetSegmentList.length;

      const sourceSlice = allSource.slice(sourceIdx, sourceIdx + sourceCount);
      const targetSlice = allTarget.slice(targetIdx, targetIdx + targetCount);

      result.push(new Alignment(sourceSlice, targetSlice, refAl.score));

      sourceIdx += sourceCount;
      targetIdx += targetCount;
    }

    return result;
  }
}

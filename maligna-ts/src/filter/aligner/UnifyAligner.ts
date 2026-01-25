import { Alignment } from '../../coretypes/index.js';
import { Filter } from '../Filter.js';
import { AlignmentImpossibleException } from './AlignmentImpossibleException.js';

/**
 * Represents an aligner that aligns analogously to given reference alignment,
 * which means numbers of source and target segments in resulting list
 * will be the same as in reference alignment. This implies that numbers of
 * source and target segments must be identical in reference and input
 * alignments. Additionally scores are copied from reference alignment to
 * output alignments.
 * 
 * Useful when to perform an alignment it is required to modify or
 * destroy segment contents (tokenization, stemming, removal of rare words,
 * etc.). After that the original input can be unified with
 * damaged alignment list to obtain the undamaged result but aligned
 * correctly.
 */
export class UnifyAligner implements Filter {
  private referenceAlignmentList: Alignment[];

  constructor(referenceAlignmentList: Alignment[]) {
    this.referenceAlignmentList = referenceAlignmentList;
  }

  /**
   * Creates alignment list in which numbers of source and target segments
   * in subsequent alignments are the same as in reference alignments
   * (but the segment contents come from input alignment list).
   * Also copies scores from reference alignment list to output alignment
   * list.
   * 
   * @param alignmentList input alignment list
   * @returns alignment list unified with reference alignment
   * @throws AlignmentImpossibleException when numbers of source or target
   *         segments in input alignment list are different than on
   *         reference alignment list
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const sourceSegmentList: string[] = [];
    const targetSegmentList: string[] = [];
    
    for (const alignment of alignmentList) {
      sourceSegmentList.push(...alignment.sourceSegmentList);
      targetSegmentList.push(...alignment.targetSegmentList);
    }

    let sourceIdx = 0;
    let targetIdx = 0;
    const newAlignmentList: Alignment[] = [];

    for (const alignment of this.referenceAlignmentList) {
      const newSourceSegmentList = this.getSegmentList(
        sourceSegmentList,
        sourceIdx,
        alignment.sourceSegmentList.length
      );
      sourceIdx += alignment.sourceSegmentList.length;

      const newTargetSegmentList = this.getSegmentList(
        targetSegmentList,
        targetIdx,
        alignment.targetSegmentList.length
      );
      targetIdx += alignment.targetSegmentList.length;

      const newAlignment = new Alignment(
        newSourceSegmentList,
        newTargetSegmentList,
        alignment.score
      );
      newAlignmentList.push(newAlignment);
    }

    return newAlignmentList;
  }

  private getSegmentList(segmentList: string[], startIdx: number, size: number): string[] {
    if (startIdx + size > segmentList.length) {
      throw new AlignmentImpossibleException(
        'Segment counts in input and reference alignment lists are not equal.'
      );
    }
    return segmentList.slice(startIdx, startIdx + size);
  }
}

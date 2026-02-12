import { AlignAlgorithm } from '../AlignAlgorithm';
import { Alignment } from '../../../../coretypes/Alignment';

/**
 * One-to-one alignment algorithm.
 * Forces each source segment to align with one target segment.
 *
 * In strict mode, segments without a partner are dropped.
 * In non-strict mode, remaining segments are aligned as empty.
 */
export class OneToOneAlgorithm implements AlignAlgorithm {
  private strict: boolean;

  constructor(strict: boolean = false) {
    this.strict = strict;
  }

  align(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): Alignment[] {
    const alignments: Alignment[] = [];
    const minLength = Math.min(sourceSegmentList.length, targetSegmentList.length);

    for (let i = 0; i < minLength; i++) {
      alignments.push(
        new Alignment([sourceSegmentList[i]], [targetSegmentList[i]])
      );
    }

    if (!this.strict) {
      // Add remaining source segments as empty target
      for (let i = minLength; i < sourceSegmentList.length; i++) {
        alignments.push(new Alignment([sourceSegmentList[i]], []));
      }
      // Add remaining target segments as empty source
      for (let i = minLength; i < targetSegmentList.length; i++) {
        alignments.push(new Alignment([], [targetSegmentList[i]]));
      }
    }

    return alignments;
  }
}

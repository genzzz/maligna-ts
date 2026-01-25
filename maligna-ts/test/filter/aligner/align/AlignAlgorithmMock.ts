import { Alignment } from '../../../../src/coretypes/Alignment';
import { AlignAlgorithm } from '../../../../src/filter/aligner/align/AlignAlgorithm';

/**
 * Mock alignment algorithm for testing purposes.
 * Aligns segments in groups of given size.
 */
export class AlignAlgorithmMock implements AlignAlgorithm {
  private groupSize: number;

  constructor(groupSize: number) {
    this.groupSize = groupSize;
  }

  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[] {
    const alignmentList: Alignment[] = [];
    
    const maxSourceGroups = Math.ceil(sourceSegmentList.length / this.groupSize);
    const maxTargetGroups = Math.ceil(targetSegmentList.length / this.groupSize);
    const maxGroups = Math.max(maxSourceGroups, maxTargetGroups);
    
    for (let i = 0; i < maxGroups; i++) {
      const sourceStart = i * this.groupSize;
      const sourceEnd = Math.min(sourceStart + this.groupSize, sourceSegmentList.length);
      const targetStart = i * this.groupSize;
      const targetEnd = Math.min(targetStart + this.groupSize, targetSegmentList.length);
      
      const sourceGroup = sourceSegmentList.slice(sourceStart, sourceEnd);
      const targetGroup = targetSegmentList.slice(targetStart, targetEnd);
      
      const alignment = new Alignment([...sourceGroup], [...targetGroup]);
      alignmentList.push(alignment);
    }
    
    return alignmentList;
  }
}

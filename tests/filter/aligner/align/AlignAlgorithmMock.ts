import { AlignAlgorithm } from '../../../../src/filter/aligner/align/AlignAlgorithm';
import { Alignment } from '../../../../src/coretypes/Alignment';

/**
 * Mock alignment algorithm for testing.
 * Groups segments into alignments of a fixed chunk size.
 */
export class AlignAlgorithmMock implements AlignAlgorithm {
  private chunkSize: number;

  constructor(chunkSize: number) {
    this.chunkSize = chunkSize;
  }

  align(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): Alignment[] {
    const alignments: Alignment[] = [];
    let sourceIndex = 0;
    let targetIndex = 0;

    while (sourceIndex < sourceSegmentList.length || targetIndex < targetSegmentList.length) {
      const sourceChunk: string[] = [];
      const targetChunk: string[] = [];

      for (let i = 0; i < this.chunkSize && sourceIndex < sourceSegmentList.length; i++) {
        sourceChunk.push(sourceSegmentList[sourceIndex++]);
      }

      for (let i = 0; i < this.chunkSize && targetIndex < targetSegmentList.length; i++) {
        targetChunk.push(targetSegmentList[targetIndex++]);
      }

      if (sourceChunk.length > 0 || targetChunk.length > 0) {
        alignments.push(new Alignment(sourceChunk, targetChunk));
      }
    }

    return alignments;
  }
}

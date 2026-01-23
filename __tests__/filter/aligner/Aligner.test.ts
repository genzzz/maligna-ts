import { Alignment } from '../../../src/core/Alignment';
import { Aligner } from '../../../src/filter/aligner/Aligner';
import { AlignAlgorithm } from '../../../src/filter/aligner/AlignAlgorithm';

// Mock alignment algorithm for testing
class MockAlignAlgorithm implements AlignAlgorithm {
  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[] {
    // Simply create 1-1 alignments for each pair
    const result: Alignment[] = [];
    const maxLen = Math.max(sourceSegmentList.length, targetSegmentList.length);

    for (let i = 0; i < maxLen; i++) {
      const source = i < sourceSegmentList.length ? [sourceSegmentList[i]] : [];
      const target = i < targetSegmentList.length ? [targetSegmentList[i]] : [];
      result.push(new Alignment(source, target, 0));
    }

    return result.length > 0 ? result : [new Alignment([], [], 0)];
  }
}

// Algorithm that merges all into one
class MergeAlgorithm implements AlignAlgorithm {
  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[] {
    return [new Alignment([...sourceSegmentList], [...targetSegmentList], 0)];
  }
}

describe('Aligner', () => {
  describe('apply', () => {
    it('should apply algorithm to each alignment', () => {
      const algorithm = new MockAlignAlgorithm();
      const aligner = new Aligner(algorithm);

      const alignments = [
        new Alignment(['Source1', 'Source2'], ['Target1', 'Target2']),
      ];

      const result = aligner.apply(alignments);

      // MockAlignAlgorithm creates 1-1 pairs
      expect(result.length).toBe(2);
      expect(result[0].getSourceSegmentList()).toEqual(['Source1']);
      expect(result[0].getTargetSegmentList()).toEqual(['Target1']);
      expect(result[1].getSourceSegmentList()).toEqual(['Source2']);
      expect(result[1].getTargetSegmentList()).toEqual(['Target2']);
    });

    it('should handle multiple input alignments', () => {
      const algorithm = new MockAlignAlgorithm();
      const aligner = new Aligner(algorithm);

      const alignments = [
        new Alignment(['A', 'B'], ['X', 'Y']),
        new Alignment(['C'], ['Z']),
      ];

      const result = aligner.apply(alignments);

      expect(result.length).toBe(3);
    });

    it('should handle empty alignment list', () => {
      const algorithm = new MockAlignAlgorithm();
      const aligner = new Aligner(algorithm);

      const result = aligner.apply([]);

      expect(result.length).toBe(0);
    });

    it('should handle alignments with empty segments', () => {
      const algorithm = new MockAlignAlgorithm();
      const aligner = new Aligner(algorithm);

      const alignments = [new Alignment([], [])];

      const result = aligner.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual([]);
      expect(result[0].getTargetSegmentList()).toEqual([]);
    });

    it('should work with merge algorithm', () => {
      const algorithm = new MergeAlgorithm();
      const aligner = new Aligner(algorithm);

      const alignments = [
        new Alignment(['A', 'B'], ['X', 'Y']),
        new Alignment(['C'], ['Z']),
      ];

      const result = aligner.apply(alignments);

      expect(result.length).toBe(2);
      expect(result[0].getSourceSegmentList()).toEqual(['A', 'B']);
      expect(result[0].getTargetSegmentList()).toEqual(['X', 'Y']);
      expect(result[1].getSourceSegmentList()).toEqual(['C']);
      expect(result[1].getTargetSegmentList()).toEqual(['Z']);
    });

    it('should handle uneven segment counts', () => {
      const algorithm = new MockAlignAlgorithm();
      const aligner = new Aligner(algorithm);

      const alignments = [
        new Alignment(['A', 'B', 'C'], ['X']),
      ];

      const result = aligner.apply(alignments);

      expect(result.length).toBe(3);
      expect(result[2].getSourceSegmentList()).toEqual(['C']);
      expect(result[2].getTargetSegmentList()).toEqual([]);
    });
  });
});

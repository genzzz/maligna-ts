import { Alignment } from '../../../src/core/Alignment';
import { UnifyAligner } from '../../../src/filter/aligner/UnifyAligner';

describe('UnifyAligner', () => {
  describe('apply', () => {
    it('should copy reference segments to alignment structure', () => {
      const reference = [
        new Alignment(['Original1'], ['OriginalA']),
        new Alignment(['Original2'], ['OriginalB']),
      ];

      // Simplified alignment structure (e.g., from processing modified text)
      const alignments = [
        new Alignment(['modified1'], ['modifiedA']),
        new Alignment(['modified2'], ['modifiedB']),
      ];

      const unifier = new UnifyAligner(reference);
      const result = unifier.apply(alignments);

      expect(result.length).toBe(2);
      expect(result[0].getSourceSegmentList()).toEqual(['Original1']);
      expect(result[0].getTargetSegmentList()).toEqual(['OriginalA']);
      expect(result[1].getSourceSegmentList()).toEqual(['Original2']);
      expect(result[1].getTargetSegmentList()).toEqual(['OriginalB']);
    });

    it('should preserve alignment structure (segment counts)', () => {
      const reference = [
        new Alignment(['R1', 'R2', 'R3'], ['RA', 'RB']),
      ];

      // Alignment with 2-1 structure
      const alignments = [
        new Alignment(['X', 'Y'], ['Z']),
        new Alignment(['W'], ['V']),
      ];

      const unifier = new UnifyAligner(reference);
      const result = unifier.apply(alignments);

      // First alignment takes 2 source and 1 target from reference
      expect(result[0].getSourceSegmentList()).toEqual(['R1', 'R2']);
      expect(result[0].getTargetSegmentList()).toEqual(['RA']);

      // Second alignment takes 1 source and 1 target
      expect(result[1].getSourceSegmentList()).toEqual(['R3']);
      expect(result[1].getTargetSegmentList()).toEqual(['RB']);
    });

    it('should preserve scores from input alignments', () => {
      const reference = [
        new Alignment(['Ref'], ['Ref']),
      ];

      const alignments = [
        new Alignment(['Input'], ['Input'], 2.5),
      ];

      const unifier = new UnifyAligner(reference);
      const result = unifier.apply(alignments);

      expect(result[0].score).toBe(2.5);
    });

    it('should handle empty alignment list', () => {
      const reference = [
        new Alignment(['Ref'], ['Ref']),
      ];

      const unifier = new UnifyAligner(reference);
      const result = unifier.apply([]);

      expect(result.length).toBe(0);
    });

    it('should handle empty reference list', () => {
      const unifier = new UnifyAligner([]);

      const alignments = [
        new Alignment([], []),
      ];

      const result = unifier.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual([]);
      expect(result[0].getTargetSegmentList()).toEqual([]);
    });

    it('should work with multi-segment reference alignments', () => {
      const reference = [
        new Alignment(['A', 'B'], ['X', 'Y']),
        new Alignment(['C'], ['Z']),
      ];

      // Different structure
      const alignments = [
        new Alignment(['1', '2', '3'], ['a', 'b', 'c']),
      ];

      const unifier = new UnifyAligner(reference);
      const result = unifier.apply(alignments);

      expect(result[0].getSourceSegmentList()).toEqual(['A', 'B', 'C']);
      expect(result[0].getTargetSegmentList()).toEqual(['X', 'Y', 'Z']);
    });
  });
});

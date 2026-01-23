import { Alignment } from '../../../src/core/Alignment';
import { IntersectionSelector } from '../../../src/filter/selector/IntersectionSelector';

describe('IntersectionSelector', () => {
  describe('apply', () => {
    it('should keep alignments matching reference structure', () => {
      const reference = [
        new Alignment(['A'], ['X']),
        new Alignment(['B'], ['Y']),
      ];
      const selector = new IntersectionSelector(reference);

      const alignments = [
        new Alignment(['A'], ['X']),
        new Alignment(['B'], ['Y']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(2);
    });

    it('should filter alignments not matching reference', () => {
      const reference = [
        new Alignment(['A'], ['X']),
        new Alignment(['B', 'C'], ['Y']),
      ];
      const selector = new IntersectionSelector(reference);

      const alignments = [
        new Alignment(['A'], ['X']),
        new Alignment(['B'], ['Y', 'Z']),
      ];

      const result = selector.apply(alignments);

      // First matches (1-1), second doesn't match (1-2 vs 2-1)
      expect(result.length).toBe(1);
    });

    it('should match by segment counts not content', () => {
      const reference = [
        new Alignment(['Original1'], ['OriginalA']),
        new Alignment(['Original2', 'Original3'], ['OriginalB']),
      ];
      const selector = new IntersectionSelector(reference);

      const alignments = [
        new Alignment(['Different1'], ['DifferentA']),
        new Alignment(['Different2', 'Different3'], ['DifferentB']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(2);
    });

    it('should handle empty reference', () => {
      const selector = new IntersectionSelector([]);

      const alignments = [new Alignment(['A'], ['X'])];

      const result = selector.apply(alignments);

      expect(result.length).toBe(0);
    });

    it('should handle empty input alignments', () => {
      const reference = [new Alignment(['A'], ['X'])];
      const selector = new IntersectionSelector(reference);

      const result = selector.apply([]);

      expect(result.length).toBe(0);
    });

    it('should preserve original alignments (not replace with reference)', () => {
      const reference = [
        new Alignment(['RefSource'], ['RefTarget'], 5.0),
      ];
      const selector = new IntersectionSelector(reference);

      const alignments = [
        new Alignment(['MySource'], ['MyTarget'], 1.0),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['MySource']);
      expect(result[0].getTargetSegmentList()).toEqual(['MyTarget']);
      expect(result[0].score).toBe(1.0);
    });

    it('should handle multi-segment alignments', () => {
      const reference = [
        new Alignment(['A', 'B', 'C'], ['X', 'Y']),
      ];
      const selector = new IntersectionSelector(reference);

      const alignments = [
        new Alignment(['1', '2', '3'], ['a', 'b']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
    });

    it('should handle different total segment counts', () => {
      const reference = [
        new Alignment(['A'], ['X']),
        new Alignment(['B'], ['Y']),
        new Alignment(['C'], ['Z']),
      ];
      const selector = new IntersectionSelector(reference);

      const alignments = [
        new Alignment(['1', '2'], ['a', 'b']),
        new Alignment(['3'], ['c']),
      ];

      const result = selector.apply(alignments);

      // First position: ref is 1-1 at pos (0,0), input is 2-2 at pos (0,0) - no match
      // Second position: ref at (2,2) is C-Z which is 1-1, input is 1-1 at pos (2,2) - MATCH!
      // So one alignment matches
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['3']);
      expect(result[0].getTargetSegmentList()).toEqual(['c']);
    });
  });
});

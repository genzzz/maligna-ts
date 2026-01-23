import { Alignment } from '../../../src/core/Alignment';
import { ProbabilitySelector } from '../../../src/filter/selector/ProbabilitySelector';

describe('ProbabilitySelector', () => {
  describe('apply', () => {
    it('should keep alignments with score <= maxScore', () => {
      const selector = new ProbabilitySelector(2.0);
      const alignments = [
        new Alignment(['A'], ['X'], 1.0),
        new Alignment(['B'], ['Y'], 2.0),
        new Alignment(['C'], ['Z'], 3.0),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(2);
      expect(result.map((a) => a.score)).toEqual([1.0, 2.0]);
    });

    it('should filter alignments with score > maxScore', () => {
      const selector = new ProbabilitySelector(5.0);
      const alignments = [
        new Alignment(['A'], ['X'], 10.0),
        new Alignment(['B'], ['Y'], 4.0),
        new Alignment(['C'], ['Z'], 6.0),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].score).toBe(4.0);
    });

    it('should include alignments with exactly maxScore', () => {
      const selector = new ProbabilitySelector(2.0);
      const alignments = [new Alignment(['A'], ['X'], 2.0)];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
    });

    it('should keep all with very high maxScore', () => {
      const selector = new ProbabilitySelector(1000);
      const alignments = [
        new Alignment(['A'], ['X'], 1.0),
        new Alignment(['B'], ['Y'], 100.0),
        new Alignment(['C'], ['Z'], 500.0),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(3);
    });

    it('should filter all with zero maxScore', () => {
      const selector = new ProbabilitySelector(0);
      const alignments = [
        new Alignment(['A'], ['X'], 0.1),
        new Alignment(['B'], ['Y'], 1.0),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(0);
    });

    it('should keep alignments with zero score', () => {
      const selector = new ProbabilitySelector(0);
      const alignments = [
        new Alignment(['A'], ['X'], 0),
        new Alignment(['B'], ['Y'], 1.0),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].score).toBe(0);
    });

    it('should handle empty alignment list', () => {
      const selector = new ProbabilitySelector(1.0);
      const result = selector.apply([]);
      expect(result.length).toBe(0);
    });

    it('should handle negative maxScore', () => {
      const selector = new ProbabilitySelector(-1);
      const alignments = [
        new Alignment(['A'], ['X'], 0),
        new Alignment(['B'], ['Y'], -2),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].score).toBe(-2);
    });

    it('should preserve alignment order', () => {
      const selector = new ProbabilitySelector(5.0);
      const alignments = [
        new Alignment(['C'], ['Z'], 3.0),
        new Alignment(['A'], ['X'], 1.0),
        new Alignment(['B'], ['Y'], 4.0),
      ];

      const result = selector.apply(alignments);

      expect(result.map((a) => a.getSourceSegmentList()[0])).toEqual([
        'C',
        'A',
        'B',
      ]);
    });
  });
});

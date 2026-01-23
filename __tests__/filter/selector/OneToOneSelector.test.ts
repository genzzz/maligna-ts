import { Alignment } from '../../../src/core/Alignment';
import { OneToOneSelector } from '../../../src/filter/selector/OneToOneSelector';

describe('OneToOneSelector', () => {
  const selector = new OneToOneSelector();

  describe('apply', () => {
    it('should keep only 1-1 alignments', () => {
      const alignments = [
        new Alignment(['A'], ['X']),
        new Alignment(['B', 'C'], ['Y']),
        new Alignment(['D'], ['Z', 'W']),
        new Alignment(['E'], ['V']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(2);
      expect(result[0].getSourceSegmentList()).toEqual(['A']);
      expect(result[1].getSourceSegmentList()).toEqual(['E']);
    });

    it('should filter out 0-0 alignments', () => {
      const alignments = [
        new Alignment([], []),
        new Alignment(['A'], ['X']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
    });

    it('should filter out 1-0 alignments', () => {
      const alignments = [
        new Alignment(['A'], []),
        new Alignment(['B'], ['Y']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['B']);
    });

    it('should filter out 0-1 alignments', () => {
      const alignments = [
        new Alignment([], ['X']),
        new Alignment(['A'], ['Y']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].getTargetSegmentList()).toEqual(['Y']);
    });

    it('should filter out 2-1 alignments', () => {
      const alignments = [
        new Alignment(['A', 'B'], ['X']),
        new Alignment(['C'], ['Y']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
    });

    it('should filter out 1-2 alignments', () => {
      const alignments = [
        new Alignment(['A'], ['X', 'Y']),
        new Alignment(['B'], ['Z']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(1);
    });

    it('should handle empty alignment list', () => {
      const result = selector.apply([]);
      expect(result.length).toBe(0);
    });

    it('should return all if all are 1-1', () => {
      const alignments = [
        new Alignment(['A'], ['X']),
        new Alignment(['B'], ['Y']),
        new Alignment(['C'], ['Z']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(3);
    });

    it('should return none if none are 1-1', () => {
      const alignments = [
        new Alignment(['A', 'B'], ['X']),
        new Alignment(['C'], ['Y', 'Z']),
        new Alignment([], ['W']),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(0);
    });

    it('should preserve score', () => {
      const alignments = [new Alignment(['A'], ['X'], 2.5)];

      const result = selector.apply(alignments);

      expect(result[0].score).toBe(2.5);
    });
  });
});

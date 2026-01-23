import { Alignment } from '../../../src/core/Alignment';
import { FractionSelector } from '../../../src/filter/selector/FractionSelector';

describe('FractionSelector', () => {
  describe('constructor', () => {
    it('should accept valid fractions', () => {
      expect(() => new FractionSelector(0)).not.toThrow();
      expect(() => new FractionSelector(0.5)).not.toThrow();
      expect(() => new FractionSelector(1)).not.toThrow();
    });

    it('should reject fraction < 0', () => {
      expect(() => new FractionSelector(-0.1)).toThrow(
        'Fraction must be between 0 and 1'
      );
    });

    it('should reject fraction > 1', () => {
      expect(() => new FractionSelector(1.1)).toThrow(
        'Fraction must be between 0 and 1'
      );
    });
  });

  describe('apply', () => {
    it('should keep all alignments with fraction 1', () => {
      const selector = new FractionSelector(1);
      const alignments = [
        new Alignment(['A'], ['X'], 1.0),
        new Alignment(['B'], ['Y'], 2.0),
        new Alignment(['C'], ['Z'], 3.0),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(3);
    });

    it('should keep no alignments with fraction 0', () => {
      const selector = new FractionSelector(0);
      const alignments = [
        new Alignment(['A'], ['X'], 1.0),
        new Alignment(['B'], ['Y'], 2.0),
      ];

      const result = selector.apply(alignments);

      expect(result.length).toBe(0);
    });

    it('should keep approximately half with fraction 0.5', () => {
      const selector = new FractionSelector(0.5);
      const alignments = [
        new Alignment(['A'], ['X'], 1.0),
        new Alignment(['B'], ['Y'], 2.0),
        new Alignment(['C'], ['Z'], 3.0),
        new Alignment(['D'], ['W'], 4.0),
      ];

      const result = selector.apply(alignments);

      // Should keep alignments with lower scores (higher probability)
      expect(result.length).toBe(2);
      expect(result.every((a) => a.score <= 2.0)).toBe(true);
    });

    it('should select by score (lower is better)', () => {
      const selector = new FractionSelector(0.5);
      const alignments = [
        new Alignment(['A'], ['X'], 10.0),
        new Alignment(['B'], ['Y'], 1.0),
        new Alignment(['C'], ['Z'], 5.0),
        new Alignment(['D'], ['W'], 2.0),
      ];

      const result = selector.apply(alignments);

      // Should keep the ones with lowest scores
      const scores = result.map((a) => a.score);
      expect(scores).toContain(1.0);
      expect(scores).toContain(2.0);
    });

    it('should handle empty alignment list', () => {
      const selector = new FractionSelector(0.5);
      const result = selector.apply([]);
      expect(result.length).toBe(0);
    });

    it('should handle single alignment', () => {
      const selector = new FractionSelector(0.5);
      const alignments = [new Alignment(['A'], ['X'], 1.0)];

      const result = selector.apply(alignments);

      // Single alignment should be kept at 0.5 fraction
      expect(result.length).toBe(1);
    });

    it('should handle equal scores', () => {
      const selector = new FractionSelector(0.5);
      const alignments = [
        new Alignment(['A'], ['X'], 1.0),
        new Alignment(['B'], ['Y'], 1.0),
        new Alignment(['C'], ['Z'], 1.0),
        new Alignment(['D'], ['W'], 1.0),
      ];

      const result = selector.apply(alignments);

      // All have same score, so all should pass threshold
      expect(result.length).toBe(4);
    });
  });
});

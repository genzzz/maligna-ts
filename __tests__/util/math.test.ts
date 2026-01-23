import {
  toScore,
  toProbability,
  scoreSum,
  round,
  poissonDistribution,
  logFactorial,
} from '../../src/util/math';

describe('math utilities', () => {
  describe('toScore', () => {
    it('should convert probability to score', () => {
      expect(toScore(1)).toBeCloseTo(0, 10);
    });

    it('should return positive score for probability < 1', () => {
      expect(toScore(0.5)).toBeGreaterThan(0);
    });

    it('should return negative score for probability > 1', () => {
      expect(toScore(2)).toBeLessThan(0);
    });

    it('should handle very small probabilities', () => {
      const score = toScore(0.001);
      expect(score).toBeCloseTo(-Math.log(0.001), 10);
    });

    it('should return Infinity for probability 0', () => {
      expect(toScore(0)).toBe(Infinity);
    });
  });

  describe('toProbability', () => {
    it('should convert score to probability', () => {
      expect(toProbability(0)).toBe(1);
    });

    it('should return probability < 1 for positive score', () => {
      expect(toProbability(1)).toBeLessThan(1);
    });

    it('should return probability > 1 for negative score', () => {
      expect(toProbability(-1)).toBeGreaterThan(1);
    });

    it('should handle large scores', () => {
      const prob = toProbability(10);
      expect(prob).toBeCloseTo(Math.exp(-10), 10);
    });

    it('should return 0 for Infinity score', () => {
      expect(toProbability(Infinity)).toBe(0);
    });
  });

  describe('toScore and toProbability', () => {
    it('should be inverse functions', () => {
      const probability = 0.7;
      expect(toProbability(toScore(probability))).toBeCloseTo(probability, 10);
    });

    it('should round-trip for various values', () => {
      const probabilities = [0.1, 0.25, 0.5, 0.75, 0.9, 0.99];
      for (const p of probabilities) {
        expect(toProbability(toScore(p))).toBeCloseTo(p, 10);
      }
    });
  });

  describe('scoreSum', () => {
    it('should return 0 for empty list', () => {
      expect(scoreSum([])).toBe(0);
    });

    it('should return single score for single-element list', () => {
      expect(scoreSum([5])).toBe(5);
    });

    it('should sum probabilities correctly', () => {
      // If p1 = 0.5 and p2 = 0.5, sum = 1.0, score = 0
      const s1 = toScore(0.5);
      const s2 = toScore(0.5);
      const result = scoreSum([s1, s2]);
      expect(toProbability(result)).toBeCloseTo(1.0, 5);
    });

    it('should handle list with same scores', () => {
      const scores = [1, 1, 1];
      const result = scoreSum(scores);
      const expectedProbability = 3 * toProbability(1);
      expect(toProbability(result)).toBeCloseTo(expectedProbability, 5);
    });

    it('should return Infinity if all scores are Infinity', () => {
      expect(scoreSum([Infinity, Infinity])).toBe(Infinity);
    });

    it('should handle mixed finite and infinite scores', () => {
      const result = scoreSum([1, Infinity]);
      expect(result).toBe(1);
    });
  });

  describe('round', () => {
    it('should round to 0 decimal places', () => {
      expect(round(3.7, 0)).toBe(4);
      expect(round(3.2, 0)).toBe(3);
    });

    it('should round to 2 decimal places', () => {
      expect(round(3.1415, 2)).toBe(3.14);
      expect(round(3.1467, 2)).toBe(3.15);
    });

    it('should round to negative precision', () => {
      expect(round(1234, -2)).toBe(1200);
    });

    it('should handle 0', () => {
      expect(round(0, 5)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(round(-3.567, 2)).toBe(-3.57);
    });
  });

  describe('poissonDistribution', () => {
    it('should return positive score for valid input', () => {
      const result = poissonDistribution(5, 3);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should throw for non-positive mean', () => {
      expect(() => poissonDistribution(0, 1)).toThrow('Mean must be positive');
      expect(() => poissonDistribution(-1, 1)).toThrow('Mean must be positive');
    });

    it('should return 0 (max probability) when x equals mean for large mean', () => {
      // The mode of Poisson is close to mean
      const mean = 10;
      const atMean = poissonDistribution(mean, mean);
      const belowMean = poissonDistribution(mean, mean - 3);
      const aboveMean = poissonDistribution(mean, mean + 3);
      expect(atMean).toBeLessThanOrEqual(belowMean);
      expect(atMean).toBeLessThanOrEqual(aboveMean);
    });

    it('should increase score (decrease probability) for x far from mean', () => {
      const mean = 5;
      const close = poissonDistribution(mean, 5);
      const far = poissonDistribution(mean, 15);
      expect(far).toBeGreaterThan(close);
    });
  });

  describe('logFactorial', () => {
    it('should return 0 for 0', () => {
      expect(logFactorial(0)).toBe(0);
    });

    it('should return 0 for 1', () => {
      expect(logFactorial(1)).toBe(0);
    });

    it('should return ln(2) for 2', () => {
      expect(logFactorial(2)).toBeCloseTo(Math.log(2), 10);
    });

    it('should return ln(6) for 3', () => {
      expect(logFactorial(3)).toBeCloseTo(Math.log(6), 10);
    });

    it('should return ln(24) for 4', () => {
      expect(logFactorial(4)).toBeCloseTo(Math.log(24), 10);
    });

    it('should return ln(120) for 5', () => {
      expect(logFactorial(5)).toBeCloseTo(Math.log(120), 10);
    });

    it('should throw for negative numbers', () => {
      expect(() => logFactorial(-1)).toThrow(
        'Cannot calculate factorial for a negative number'
      );
    });

    it('should handle larger numbers', () => {
      // 10! = 3628800
      expect(logFactorial(10)).toBeCloseTo(Math.log(3628800), 5);
    });
  });
});

import { describe, test, expect } from 'vitest';
import { NormalDistributionCalculator } from '../../../src/calculator/length/NormalDistributionCalculator';
import { CharCounter, SplitCounter } from '../../../src/calculator/length/Counter';

describe('NormalDistributionCalculatorTest', () => {
  test('calculateScoreBothEmpty', () => {
    const calculator = new NormalDistributionCalculator(new CharCounter());
    const score = calculator.calculateScore([], []);
    expect(score).toBe(0);
  });

  test('calculateScoreEqualLengths', () => {
    const calculator = new NormalDistributionCalculator(new CharCounter());
    // Equal lengths → z ≈ 0 → cumulative normal ≈ 0.5 → pd ≈ 1.0 → score ≈ 0
    const score = calculator.calculateScore(['hello'], ['world']);
    expect(score).toBeCloseTo(0.0, 1);
  });

  test('calculateScoreDifferentLengths', () => {
    const calculator = new NormalDistributionCalculator(new CharCounter());
    const shortToLong = calculator.calculateScore(['hi'], ['hello world this is a long segment']);
    const equalLength = calculator.calculateScore(['hello'], ['world']);
    // Very different lengths should produce higher score (worse alignment)
    expect(shortToLong).toBeGreaterThan(equalLength);
  });

  test('calculateScoreSymmetric', () => {
    // With c=1.0, the formula should be symmetric for swapped source/target
    const calculator = new NormalDistributionCalculator(new CharCounter());
    const score1 = calculator.calculateScore(['abc'], ['defgh']);
    const score2 = calculator.calculateScore(['defgh'], ['abc']);
    // Due to the formula structure, these should be equal
    expect(score1).toBeCloseTo(score2, 2);
  });

  test('calculateScoreFiniteValues', () => {
    const calculator = new NormalDistributionCalculator(new CharCounter());
    // Various length combinations should all produce finite scores
    const inputs: [string[], string[]][] = [
      [['a'], ['b']],
      [['a'], ['bcdefghijklmnop']],
      [['short'], ['a very long target segment with many characters']],
      [['hello', 'world'], ['bonjour', 'le monde']],
    ];
    for (const [source, target] of inputs) {
      const score = calculator.calculateScore(source, target);
      expect(isFinite(score)).toBe(true);
    }
  });

  test('calculateScoreWithSplitCounter', () => {
    const calculator = new NormalDistributionCalculator(new SplitCounter());
    // SplitCounter counts words, not characters
    const score = calculator.calculateScore(
      ['hello world'],
      ['bonjour le monde']
    );
    expect(isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('calculateScoreOneEmptyOneFilled', () => {
    const calculator = new NormalDistributionCalculator(new CharCounter());
    // Source filled, target empty → high score (bad alignment)
    const score = calculator.calculateScore(['hello world'], []);
    expect(score).toBeGreaterThan(0);
    expect(isFinite(score)).toBe(true);
  });
});

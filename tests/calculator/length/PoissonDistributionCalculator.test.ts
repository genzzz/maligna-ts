import { describe, test, expect } from 'vitest';
import { PoissonDistributionCalculator } from '../../../src/calculator/length/PoissonDistributionCalculator';
import { CharCounter } from '../../../src/calculator/length/Counter';
import { Alignment } from '../../../src/coretypes/Alignment';

describe('PoissonDistributionCalculatorTest', () => {
  test('testFactorial', () => {
    expect(Math.exp(PoissonDistributionCalculator.factorial(1))).toBeCloseTo(1.0, 2);
    expect(Math.exp(PoissonDistributionCalculator.factorial(2))).toBeCloseTo(2.0, 2);
    expect(Math.exp(PoissonDistributionCalculator.factorial(3))).toBeCloseTo(6.0, 2);
    expect(Math.exp(PoissonDistributionCalculator.factorial(4))).toBeCloseTo(24.0, 2);
  });

  // Java uses assertEquals(expected, actual, 0.0001f) which means |diff| < 0.0001.
  // toBeCloseTo(x, 3) means |diff| < 0.0005 — slightly looser but close.
  // toBeCloseTo(x, 4) means |diff| < 0.00005 — that's too tight (TS uses Math.fround).
  test('testPoissonDistribution', () => {
    expect(Math.exp(-PoissonDistributionCalculator.poissonDistribution(0.5, 0))).toBeCloseTo(0.6065, 3);
    expect(Math.exp(-PoissonDistributionCalculator.poissonDistribution(1.0, 0))).toBeCloseTo(0.3679, 3);
    expect(Math.exp(-PoissonDistributionCalculator.poissonDistribution(1.0, 1))).toBeCloseTo(0.3679, 3);
    expect(Math.exp(-PoissonDistributionCalculator.poissonDistribution(1.0, 2))).toBeCloseTo(0.1839, 3);
    expect(Math.exp(-PoissonDistributionCalculator.poissonDistribution(2.0, 1))).toBeCloseTo(0.2707, 3);
    expect(Math.exp(-PoissonDistributionCalculator.poissonDistribution(2.0, 3))).toBeCloseTo(0.1805, 3);
  });

  test('testCalculateScoreEmptyBoth', () => {
    // Train with some reference data
    const trainingData = [
      new Alignment(['hello world'], ['hallo welt']),
      new Alignment(['good morning'], ['guten morgen']),
    ];
    const calculator = new PoissonDistributionCalculator(new CharCounter(), trainingData);
    // Both empty → score should be 0
    const score = calculator.calculateScore([], []);
    expect(score).toBe(0);
  });

  test('testCalculateScoreSimilarLengths', () => {
    // Train with balanced alignment data
    const trainingData = [
      new Alignment(['abcde'], ['fghij']),
      new Alignment(['ab'], ['cd']),
      new Alignment(['abcdefgh'], ['ijklmnop']),
    ];
    const calculator = new PoissonDistributionCalculator(new CharCounter(), trainingData);
    // Similar lengths should produce a relatively low score (good alignment)
    const score = calculator.calculateScore(['abcde'], ['fghij']);
    expect(score).toBeGreaterThan(0);
    expect(isFinite(score)).toBe(true);
  });

  test('testCalculateScoreSourceOnly', () => {
    // Train with varied data so length histogram has non-trivial probabilities
    const trainingData = [
      new Alignment(['abcde'], ['fghij']),
      new Alignment(['ab'], ['cd']),
      new Alignment(['abcdefgh'], ['ijklmnop']),
    ];
    const calculator = new PoissonDistributionCalculator(new CharCounter(), trainingData);
    // Empty source, filled target → language score for target only
    const score = calculator.calculateScore([], ['fghij']);
    expect(isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('testCalculateScoreTargetOnly', () => {
    // Train with varied data
    const trainingData = [
      new Alignment(['abcde'], ['fghij']),
      new Alignment(['ab'], ['cd']),
      new Alignment(['abcdefgh'], ['ijklmnop']),
    ];
    const calculator = new PoissonDistributionCalculator(new CharCounter(), trainingData);
    // Filled source, empty target → language score for source (no translation score)
    const score = calculator.calculateScore(['abcde'], []);
    expect(isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('testCalculateScoreDifferentLengths', () => {
    const trainingData = [
      new Alignment(['abcde'], ['fghij']),
      new Alignment(['ab'], ['cd']),
    ];
    const calculator = new PoissonDistributionCalculator(new CharCounter(), trainingData);
    const similarScore = calculator.calculateScore(['abcde'], ['fghij']);
    const differentScore = calculator.calculateScore(['abcde'], ['f']);
    // Very different lengths should have higher score (worse alignment)
    expect(differentScore).toBeGreaterThan(similarScore);
  });
});

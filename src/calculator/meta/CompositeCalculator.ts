import { Calculator } from '../Calculator.js';

/**
 * Composite calculator that combines multiple calculators.
 * Returns the sum of scores from all calculators.
 */
export class CompositeCalculator implements Calculator {
  private readonly calculators: Calculator[];

  constructor(calculators: Calculator[]) {
    this.calculators = [...calculators];
  }

  calculateScore(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): number {
    let totalScore = 0;
    for (const calculator of this.calculators) {
      totalScore += calculator.calculateScore(
        sourceSegmentList,
        targetSegmentList
      );
    }
    return totalScore;
  }
}

/**
 * Calculator that returns the minimum score from multiple calculators.
 */
export class MinimumCalculator implements Calculator {
  private readonly calculators: Calculator[];

  constructor(calculators: Calculator[]) {
    this.calculators = [...calculators];
  }

  calculateScore(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): number {
    let minScore = Infinity;
    for (const calculator of this.calculators) {
      const score = calculator.calculateScore(
        sourceSegmentList,
        targetSegmentList
      );
      if (score < minScore) {
        minScore = score;
      }
    }
    return minScore;
  }
}

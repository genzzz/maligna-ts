import { Calculator } from '../Calculator';

/**
 * Composite calculator that sums scores from multiple calculators.
 * In probability space this corresponds to multiplication.
 */
export class CompositeCalculator implements Calculator {
  private calculators: Calculator[];

  constructor(calculators: Calculator[]) {
    this.calculators = calculators;
  }

  calculateScore(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): number {
    let totalScore = 0;
    for (const calculator of this.calculators) {
      totalScore = Math.fround(totalScore + calculator.calculateScore(sourceSegmentList, targetSegmentList));
      if (totalScore === Infinity) {
        break;
      }
    }
    return totalScore;
  }
}

/**
 * Minimum calculator — if the test calculator score is <= threshold,
 * returns the minimum score; otherwise delegates to the main calculator.
 */
export class MinimumCalculator implements Calculator {
  private testCalculator: Calculator;
  private mainCalculator: Calculator;
  private threshold: number;

  constructor(
    testCalculator: Calculator,
    mainCalculator: Calculator,
    threshold: number
  ) {
    this.testCalculator = testCalculator;
    this.mainCalculator = mainCalculator;
    this.threshold = threshold;
  }

  calculateScore(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): number {
    const testScore = this.testCalculator.calculateScore(
      sourceSegmentList,
      targetSegmentList
    );
    if (testScore <= this.threshold) {
      return testScore;
    }
    return this.mainCalculator.calculateScore(
      sourceSegmentList,
      targetSegmentList
    );
  }
}

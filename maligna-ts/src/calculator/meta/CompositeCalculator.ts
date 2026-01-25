import { Calculator } from '../../calculator/index.js';

/**
 * Represents composite calculator. Alignment score is a sum of
 * scores returned by all calculators (equivalent of product of probabilities
 * returned by all calculators).
 */
export class CompositeCalculator implements Calculator {
  private calculatorList: Calculator[];

  constructor(calculatorList: Calculator[]) {
    this.calculatorList = calculatorList;
  }

  calculateScore(sourceSegmentList: readonly string[], targetSegmentList: readonly string[]): number {
    let score = 0;
    for (const calculator of this.calculatorList) {
      score += calculator.calculateScore(sourceSegmentList, targetSegmentList);
      if (score === Number.POSITIVE_INFINITY) {
        break;
      }
    }
    return score;
  }
}

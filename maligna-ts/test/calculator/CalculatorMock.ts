import { Calculator } from '../../src/calculator/Calculator';

/**
 * Mock calculator for testing purposes.
 * Returns a constant score.
 */
export class CalculatorMock implements Calculator {
  private score: number;

  constructor(score: number) {
    this.score = score;
  }

  calculateScore(
    _sourceSegmentList: readonly string[],
    _targetSegmentList: readonly string[]
  ): number {
    return this.score;
  }
}

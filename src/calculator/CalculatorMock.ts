import { Calculator } from './Calculator';

/**
 * Mock calculator for testing — always returns a fixed score.
 */
export class CalculatorMock implements Calculator {
  private score: number;

  constructor(score: number = 0) {
    this.score = score;
  }

  calculateScore(
    _sourceSegmentList: string[],
    _targetSegmentList: string[]
  ): number {
    return this.score;
  }
}

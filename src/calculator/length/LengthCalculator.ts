import { Calculator } from '../Calculator.js';
import { Counter } from './Counter.js';

/**
 * Abstract base class for length-based calculators.
 * Converts segments to lengths and delegates score calculation to subclasses.
 */
export abstract class LengthCalculator implements Calculator {
  protected readonly counter: Counter;

  constructor(counter: Counter) {
    this.counter = counter;
  }

  calculateScore(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): number {
    const sourceLengthList = this.calculateLengthList(sourceSegmentList);
    const targetLengthList = this.calculateLengthList(targetSegmentList);
    return this.calculateLengthScore(sourceLengthList, targetLengthList);
  }

  /**
   * Calculates lengths of all segments in the list.
   */
  protected calculateLengthList(segmentList: readonly string[]): number[] {
    return segmentList.map((segment) => this.counter.count(segment));
  }

  /**
   * Calculates total length of all segments.
   */
  protected calculateTotalLength(lengthList: number[]): number {
    return lengthList.reduce((sum, len) => sum + len, 0);
  }

  /**
   * Subclasses must implement this to calculate score from lengths.
   */
  protected abstract calculateLengthScore(
    sourceLengthList: number[],
    targetLengthList: number[]
  ): number;
}

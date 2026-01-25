import { Calculator } from '../Calculator.js';
import { Counter } from './counter/Counter.js';

/**
 * Represents calculator that computes alignment probability based only on
 * segment length. Implements part of the Calculator functionality
 * and provides utility functions to inheriting concrete length-based
 * calculators.
 */
export abstract class LengthCalculator implements Calculator {
  protected readonly counter: Counter;

  /**
   * Creates a calculator.
   * @param counter segment length counter (for example character count, word count)
   */
  constructor(counter: Counter) {
    this.counter = counter;
  }

  /**
   * Calculates alignment score first by computing lengths of all the segments
   * and later passing the results and control to the subclasses to do
   * the actual score calculation.
   */
  calculateScore(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): number {
    const sourceLengthList = this.calculateLengthList(sourceSegmentList);
    const targetLengthList = this.calculateLengthList(targetSegmentList);
    return this.calculateLengthScore(sourceLengthList, targetLengthList);
  }

  /**
   * Calculates and returns lengths of subsequent segments.
   * @param segmentList segment list
   * @returns list of lengths of segments
   */
  protected calculateLengthList(segmentList: readonly string[]): number[] {
    const lengthList: number[] = [];
    for (const segment of segmentList) {
      const length = this.counter.calculateLength(segment);
      if (length > 0) {
        lengthList.push(length);
      }
    }
    return lengthList;
  }

  /**
   * Utility function to calculate total length of the segments.
   * Returns sum of the lengths on the input list. Used by subclasses.
   *
   * @param lengthList list containing lengths
   * @returns sum of lengths on the list
   */
  protected calculateTotalLength(lengthList: readonly number[]): number {
    let totalLength = 0;
    for (const length of lengthList) {
      totalLength += length;
    }
    return totalLength;
  }

  /**
   * Abstract method implemented by subclasses to compute the actual score.
   *
   * @param sourceLengthList lengths of source segments
   * @param targetLengthList lengths of target segments
   * @returns source to target segments alignment score, >= 0
   */
  protected abstract calculateLengthScore(
    sourceLengthList: readonly number[],
    targetLengthList: readonly number[]
  ): number;
}

import { LengthCalculator } from './LengthCalculator.js';
import { Counter } from './counter/Counter.js';

/**
 * Represents calculator computing alignment score assuming that
 * segment lengths have normal distribution with given constant parameters.
 *
 * @see "A Program for Aligning Sentences in Bilingual Corpora,
 *     William A. Gale, Kenneth W. Church"
 */
export class NormalDistributionCalculator extends LengthCalculator {
  public static readonly PARAMETER_C = 1.0;
  public static readonly PARAMETER_S_SQUARE = 6.8;

  /**
   * Creates calculator.
   * @param counter segment length counter
   */
  constructor(counter: Counter) {
    super(counter);
  }

  /**
   * Calculates alignment score.
   */
  protected calculateLengthScore(
    sourceLengthList: readonly number[],
    targetLengthList: readonly number[]
  ): number {
    const sourceSegmentLength = this.calculateTotalLength(sourceLengthList);
    const targetSegmentLength = this.calculateTotalLength(targetLengthList);
    return this.calculateScoreFromLengths(
      sourceSegmentLength,
      targetSegmentLength
    );
  }

  /**
   * Calculates probability of target segment of given length being
   * translation of source segment with given length. If both lengths are
   * equal to zero returns zero.
   */
  private calculateScoreFromLengths(
    sourceSegmentLength: number,
    targetSegmentLength: number
  ): number {
    if (sourceSegmentLength === 0 && targetSegmentLength === 0) {
      return 0.0;
    } else {
      const mean =
        (sourceSegmentLength +
          targetSegmentLength / NormalDistributionCalculator.PARAMETER_C) /
        2.0;
      const z =
        Math.abs(
          NormalDistributionCalculator.PARAMETER_C * sourceSegmentLength -
            targetSegmentLength
        ) /
        Math.sqrt(NormalDistributionCalculator.PARAMETER_S_SQUARE * mean);
      let pd = 2.0 * (1.0 - this.cumulativeNormalDistribution(z));
      // Needed because sometimes returns zero
      pd = Math.max(pd, Number.MIN_VALUE);
      return -Math.log(pd);
    }
  }

  /**
   * Calculates value of normal distribution for given z position (z >= 0).
   *
   * @see "Handbook of Mathematical Functions, Abrahamowitz, Stegun"
   * @param z random variable
   * @returns random variable distribution value
   */
  private cumulativeNormalDistribution(z: number): number {
    const t = 1.0 / (1.0 + 0.2316419 * z);
    const pd =
      1.0 -
      0.3989423 *
        Math.exp((-z * z) / 2.0) *
        ((((1.330274429 * t - 1.821255978) * t + 1.781477937) * t -
          0.356563782) *
          t +
          0.319381530) *
        t;
    return pd;
  }
}

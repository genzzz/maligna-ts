import { Calculator } from '../Calculator';
import { Counter } from './Counter';

/**
 * Java's Float.MIN_VALUE (smallest positive non-zero float).
 */
const FLOAT_MIN_VALUE = 1.401298464324817e-45;

/**
 * Normal distribution calculator implementing the Gale & Church algorithm.
 *
 * Uses character/word length ratios with a normal distribution model.
 * The cumulative normal distribution is approximated using
 * the Abrahamowitz & Stegun method.
 *
 * All arithmetic matches the Java implementation's float (32-bit) precision
 * to produce identical scores.
 *
 * @see "A program for aligning sentences in bilingual corpora"
 *      Gale, W. A., & Church, K. W. (1993)
 */
export class NormalDistributionCalculator implements Calculator {
  /**
   * Mean of source/target length ratio (c parameter).
   * Java: public static final float PARAMETER_C = 1.0f;
   */
  private static readonly PARAMETER_C = Math.fround(1.0);

  /**
   * Variance of source/target length ratio (s^2 parameter).
   * Java: public static final float PARAMETER_S_SQUARE = 6.8f;
   */
  private static readonly PARAMETER_S_SQUARE = Math.fround(6.8);

  private counter: Counter;

  constructor(counter: Counter) {
    this.counter = counter;
  }

  calculateScore(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): number {
    const sourceLength = this.counter.count(sourceSegmentList);
    const targetLength = this.counter.count(targetSegmentList);

    if (sourceLength === 0 && targetLength === 0) {
      return 0.0;
    }

    // Java: double mean = (sourceSegmentLength + targetSegmentLength / PARAMETER_C) / 2.0;
    const mean = (sourceLength + targetLength / NormalDistributionCalculator.PARAMETER_C) / 2.0;
    // Java: double z = Math.abs((PARAMETER_C * sourceSegmentLength - targetSegmentLength) / Math.sqrt(PARAMETER_S_SQUARE * mean));
    const z = Math.abs(
      (NormalDistributionCalculator.PARAMETER_C * sourceLength - targetLength) /
        Math.sqrt(NormalDistributionCalculator.PARAMETER_S_SQUARE * mean)
    );
    let pd = 2.0 * (1.0 - this.cumulativeNormalDistribution(z));
    // Java: pd = Math.max(pd, Float.MIN_VALUE);
    pd = Math.max(pd, FLOAT_MIN_VALUE);
    // Java: return (float)-Math.log(pd);
    return Math.fround(-Math.log(pd));
  }

  /**
   * Cumulative normal distribution function approximation.
   * Uses the Abrahamowitz & Stegun approximation (equation 26.2.17).
   * Constants match Java source exactly.
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

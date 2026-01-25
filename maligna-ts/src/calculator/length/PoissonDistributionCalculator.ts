import { LengthCalculator } from './LengthCalculator.js';
import { Counter } from './counter/Counter.js';
import { Alignment } from '../../coretypes/Alignment.js';
import { LengthModel, trainLengthModel } from '../../model/length/LengthModel.js';

/**
 * Represents length-based calculator that computes alignment score
 * assuming that alignment lengths have Poisson distribution.
 * Calculates length models (models based on frequency of occurrence of
 * segment lengths) using training corpus (can be the same as the input corpus).
 */
export class PoissonDistributionCalculator extends LengthCalculator {
  private readonly sourceLengthModel: LengthModel;
  private readonly targetLengthModel: LengthModel;
  private readonly meanLengthRatio: number;

  /**
   * Creates calculator. Calculates source and target LengthModel
   * using reference corpus (can be the same as actual corpus being aligned).
   *
   * @param counter length counter
   * @param alignmentList reference alignment
   */
  constructor(counter: Counter, alignmentList: readonly Alignment[]) {
    super(counter);

    const sourceSegmentList: string[] = [];
    const targetSegmentList: string[] = [];

    for (const alignment of alignmentList) {
      sourceSegmentList.push(...alignment.sourceSegmentList);
      targetSegmentList.push(...alignment.targetSegmentList);
    }

    this.sourceLengthModel = this.trainLengthModelFromSegments(sourceSegmentList);
    this.targetLengthModel = this.trainLengthModelFromSegments(targetSegmentList);
    this.meanLengthRatio =
      this.targetLengthModel.meanLength / this.sourceLengthModel.meanLength;
  }

  /**
   * Calculates length model of given segment list.
   */
  private trainLengthModelFromSegments(segmentList: string[]): LengthModel {
    const lengthList = this.calculateLengthList(segmentList);
    return trainLengthModel(lengthList);
  }

  /**
   * Calculates alignment score. If both input lists are empty returns zero.
   * If only one of them is empty returns the other language score
   * (probability of segment being part of language). If both are non-zero
   * then returns translation score (probability of target segments being
   * translations of source segments) added to language score of source
   * segments.
   */
  protected calculateLengthScore(
    sourceLengthList: readonly number[],
    targetLengthList: readonly number[]
  ): number {
    let score: number;

    if (sourceLengthList.length === 0 && targetLengthList.length === 0) {
      score = 0.0;
    } else if (sourceLengthList.length === 0) {
      score = this.calculateLanguageScore(
        targetLengthList,
        this.targetLengthModel
      );
    } else {
      score = this.calculateLanguageScore(
        sourceLengthList,
        this.sourceLengthModel
      );
      if (targetLengthList.length > 0) {
        score += this.calculateTranslationScore(
          sourceLengthList,
          targetLengthList
        );
      }
    }

    return score;
  }

  /**
   * Calculates the score (equal to -ln(probability)) of segments of given
   * lengths being part of given language (occur in given length model).
   */
  private calculateLanguageScore(
    lengthList: readonly number[],
    lengthModel: LengthModel
  ): number {
    let score = 0.0;
    for (const length of lengthList) {
      score += -Math.log(lengthModel.getLengthProbability(length));
    }
    return score;
  }

  /**
   * Calculates score of target segments of given lengths being translations
   * of source segments of given lengths.
   */
  private calculateTranslationScore(
    sourceLengthList: readonly number[],
    targetLengthList: readonly number[]
  ): number {
    const sourceTotalLength = this.calculateTotalLength(sourceLengthList);
    const targetTotalLength = this.calculateTotalLength(targetLengthList);
    const mean = sourceTotalLength * this.meanLengthRatio;
    return poissonDistribution(mean, targetTotalLength);
  }
}

/**
 * Calculates value of a Poisson distribution function at given point (x).
 * Returns score (-ln(probability)).
 * @param mean poisson distribution mean
 * @param x x value
 * @returns score value
 */
export function poissonDistribution(mean: number, x: number): number {
  if (mean <= 0) {
    throw new Error('Mean must be > 0');
  }
  return mean + -x * Math.log(mean) + factorial(x);
}

/**
 * Returns logarithm from factorial of a given number ln(x!).
 * @param x number
 * @returns ln(x!)
 */
export function factorial(x: number): number {
  if (x < 0) {
    throw new Error(`Cannot calculate factorial for a negative number: ${x}.`);
  }
  let y = 0;
  for (let i = 2; i <= x; ++i) {
    y += Math.log(i);
  }
  return y;
}

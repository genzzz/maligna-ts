import { Alignment } from '../../core/Alignment.js';
import { LengthModel, trainLengthModel } from '../../model/length/LengthModel.js';
import { Counter } from './Counter.js';
import { LengthCalculator } from './LengthCalculator.js';
import { poissonDistribution } from '../../util/math.js';

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
   */
  constructor(counter: Counter, alignmentList: Alignment[]) {
    super(counter);

    const sourceSegmentList: string[] = [];
    const targetSegmentList: string[] = [];
    for (const alignment of alignmentList) {
      sourceSegmentList.push(...alignment.getSourceSegmentList());
      targetSegmentList.push(...alignment.getTargetSegmentList());
    }

    this.sourceLengthModel = this.trainLengthModel(sourceSegmentList);
    this.targetLengthModel = this.trainLengthModel(targetSegmentList);
    this.meanLengthRatio =
      this.targetLengthModel.meanLength / this.sourceLengthModel.meanLength;
  }

  private trainLengthModel(segmentList: string[]): LengthModel {
    const lengthList = this.calculateLengthList(segmentList);
    return trainLengthModel(lengthList);
  }

  protected calculateLengthScore(
    sourceLengthList: number[],
    targetLengthList: number[]
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
   * Calculates the score of segments of given lengths being part of given language.
   */
  private calculateLanguageScore(
    lengthList: number[],
    lengthModel: LengthModel
  ): number {
    let score = 0.0;
    for (const length of lengthList) {
      score += -Math.log(lengthModel.getLengthProbability(length));
    }
    return score;
  }

  /**
   * Calculates score of target segments being translations of source segments.
   */
  private calculateTranslationScore(
    sourceLengthList: number[],
    targetLengthList: number[]
  ): number {
    const sourceTotalLength = this.calculateTotalLength(sourceLengthList);
    const targetTotalLength = this.calculateTotalLength(targetLengthList);
    const mean = sourceTotalLength * this.meanLengthRatio;
    return poissonDistribution(mean, targetTotalLength);
  }
}

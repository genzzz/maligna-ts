import { Alignment } from '../../core/Alignment.js';
import { LengthModel, trainLengthModel } from '../../model/length/LengthModel.js';
import { Counter } from './Counter.js';
import { LengthCalculator } from './LengthCalculator.js';

/**
 * Represents length-based calculator that computes alignment score
 * assuming that alignment lengths have Normal (Gaussian) distribution.
 * This is similar to the Gale and Church algorithm approach.
 */
export class NormalDistributionCalculator extends LengthCalculator {
  private readonly sourceLengthModel: LengthModel;
  private readonly targetLengthModel: LengthModel;
  private readonly meanLengthRatio: number;
  private readonly varianceRatio: number;

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
    this.varianceRatio = this.calculateVarianceRatio();
  }

  private trainLengthModel(segmentList: string[]): LengthModel {
    const lengthList = this.calculateLengthList(segmentList);
    return trainLengthModel(lengthList);
  }

  private calculateVarianceRatio(): number {
    // Default variance ratio based on Gale and Church paper
    return 6.8;
  }

  protected calculateLengthScore(
    sourceLengthList: number[],
    targetLengthList: number[]
  ): number {
    if (sourceLengthList.length === 0 && targetLengthList.length === 0) {
      return 0.0;
    }

    const sourceTotalLength = this.calculateTotalLength(sourceLengthList);
    const targetTotalLength = this.calculateTotalLength(targetLengthList);

    if (sourceTotalLength === 0) {
      return this.calculateLanguageScore(targetLengthList);
    }

    const expectedTargetLength = sourceTotalLength * this.meanLengthRatio;
    const variance = sourceTotalLength * this.varianceRatio;
    const deviation = targetTotalLength - expectedTargetLength;

    // -ln(probability) for normal distribution
    const score =
      0.5 * Math.log(2 * Math.PI * variance) +
      (deviation * deviation) / (2 * variance);

    return score;
  }

  private calculateLanguageScore(lengthList: number[]): number {
    let score = 0.0;
    for (const length of lengthList) {
      score += -Math.log(this.targetLengthModel.getLengthProbability(length));
    }
    return score;
  }
}

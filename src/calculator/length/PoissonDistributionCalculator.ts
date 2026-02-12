import { Calculator } from '../Calculator';
import { Counter } from './Counter';
import { Alignment } from '../../coretypes/Alignment';
import { LengthModel, MutableLengthModel } from '../../model/length/LengthModel';

/**
 * Poisson distribution calculator.
 *
 * Trains length models from a reference corpus using per-segment lengths
 * (matching Java's LengthCalculator approach) and uses Poisson distribution
 * for translation scoring, with histogram-based language scoring.
 *
 * All scoring is done directly in score space (score = -ln(probability))
 * to avoid numerical underflow.
 */
export class PoissonDistributionCalculator implements Calculator {
  private counter: Counter;
  private sourceLengthModel: LengthModel;
  private targetLengthModel: LengthModel;
  private meanLengthRatio: number;

  constructor(counter: Counter, alignmentList: Alignment[]) {
    this.counter = counter;

    // Flatten all segments from all alignments, then count each individually
    // (matching Java: sourceSegmentList.addAll(alignment.getSourceSegmentList()))
    const allSourceSegments: string[] = [];
    const allTargetSegments: string[] = [];
    for (const alignment of alignmentList) {
      for (const seg of alignment.sourceSegmentList) {
        allSourceSegments.push(seg);
      }
      for (const seg of alignment.targetSegmentList) {
        allTargetSegments.push(seg);
      }
    }

    this.sourceLengthModel = this.trainLengthModel(allSourceSegments);
    this.targetLengthModel = this.trainLengthModel(allTargetSegments);
    // Java: float meanLengthRatio = targetLengthModel.getMeanLength() / sourceLengthModel.getMeanLength();
    this.meanLengthRatio = Math.fround(
      this.targetLengthModel.getMeanLength() / this.sourceLengthModel.getMeanLength()
    );
  }

  /**
   * Train a length model from individual segment lengths.
   * Matches Java's trainLengthModel → calculateLengthList → LengthModelUtil.train
   */
  private trainLengthModel(segments: string[]): LengthModel {
    const model = new MutableLengthModel();
    for (const segment of segments) {
      const length = this.counter.countSingle(segment);
      if (length > 0) {
        model.addLength(length);
      }
    }
    model.normalize();
    return model;
  }

  /**
   * Calculates alignment score. Works entirely in score space (score = -ln(prob)).
   * Matches Java's calculateLengthScore logic:
   * - If both lists empty → 0
   * - If only source empty → language score of target
   * - Otherwise → language score of source + (if target non-empty) translation score
   */
  calculateScore(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): number {
    const sourceLengths = this.calculateLengthList(sourceSegmentList);
    const targetLengths = this.calculateLengthList(targetSegmentList);
    return this.calculateLengthScore(sourceLengths, targetLengths);
  }

  /**
   * Calculate per-segment length list, filtering out zero-length segments.
   * Matches Java's LengthCalculator.calculateLengthList.
   */
  private calculateLengthList(segmentList: string[]): number[] {
    const lengths: number[] = [];
    for (const segment of segmentList) {
      const length = this.counter.countSingle(segment);
      if (length > 0) {
        lengths.push(length);
      }
    }
    return lengths;
  }

  private calculateLengthScore(
    sourceLengthList: number[],
    targetLengthList: number[]
  ): number {
    if (sourceLengthList.length === 0 && targetLengthList.length === 0) {
      return 0;
    } else if (sourceLengthList.length === 0) {
      return this.calculateLanguageScore(targetLengthList, this.targetLengthModel);
    } else {
      let score: number = this.calculateLanguageScore(sourceLengthList, this.sourceLengthModel);
      if (targetLengthList.length > 0) {
        // Java: float score += calculateTranslationScore(...) — float accumulation
        score = Math.fround(score + this.calculateTranslationScore(sourceLengthList, targetLengthList));
      }
      return score;
    }
  }

  /**
   * Language score: sum of -ln(P(length)) for each segment, using
   * the histogram probability from the length model.
   * Matches Java's calculateLanguageScore.
   */
  private calculateLanguageScore(
    lengthList: number[],
    lengthModel: LengthModel
  ): number {
    // Java: float score = 0.0f; score += -Math.log(...) — float accumulation each step
    let score = 0;
    for (const length of lengthList) {
      const prob = lengthModel.getLengthProbability(length);
      score = Math.fround(score + -Math.log(prob));
    }
    return score;
  }

  /**
   * Translation score: Poisson distribution on total lengths.
   * mean = sourceTotalLength * meanLengthRatio
   * Returns score directly (in -ln space).
   * Matches Java's calculateTranslationScore.
   */
  private calculateTranslationScore(
    sourceLengthList: number[],
    targetLengthList: number[]
  ): number {
    const sourceTotalLength = this.totalLength(sourceLengthList);
    const targetTotalLength = this.totalLength(targetLengthList);
    // Java: float mean = sourceTotalLength * meanLengthRatio;
    const mean = Math.fround(sourceTotalLength * this.meanLengthRatio);
    return PoissonDistributionCalculator.poissonDistribution(mean, targetTotalLength);
  }

  private totalLength(lengths: number[]): number {
    let total = 0;
    for (const l of lengths) {
      total += l;
    }
    return total;
  }

  /**
   * Poisson distribution score (= -ln(P(X=x))).
   * Returns: mean - x * ln(mean) + ln(x!)
   * This is the SCORE, not the probability. Matches Java exactly.
   */
  static poissonDistribution(mean: number, x: number): number {
    if (mean <= 0) {
      return x === 0 ? 0 : Infinity;
    }
    // Java: return mean + -x * (float)Math.log(mean) + factorial(x);
    return Math.fround(
      Math.fround(mean + Math.fround(-x * Math.fround(Math.log(mean)))) +
        PoissonDistributionCalculator.factorial(x)
    );
  }

  /**
   * Computes ln(x!) using a simple loop.
   * Java: float y = 0; y += Math.log(i); — float accumulation each iteration.
   */
  static factorial(x: number): number {
    if (x < 0) {
      throw new Error(`Cannot calculate factorial for a negative number: ${x}.`);
    }
    let y = 0;
    for (let i = 2; i <= x; i++) {
      y = Math.fround(y + Math.log(i));
    }
    return y;
  }
}

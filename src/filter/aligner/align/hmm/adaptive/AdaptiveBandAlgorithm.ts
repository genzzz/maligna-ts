import { Calculator } from '../../../../../calculator/Calculator';
import { AlignAlgorithm } from '../../AlignAlgorithm';
import { Alignment } from '../../../../../coretypes/Alignment';
import { BandMatrixFactory } from '../../../../../matrix/BandMatrix';
import { HmmAlignAlgorithmFactory } from '../HmmAlignAlgorithmFactory';

/**
 * Adaptive band algorithm that iteratively widens the band matrix
 * until the alignment path doesn't touch the band margin.
 * Matches Java's AdaptiveBandAlgorithm logic exactly.
 */
export class AdaptiveBandAlgorithm implements AlignAlgorithm {
  static readonly DEFAULT_BAND_INCREMENT_RATIO = 1.5;
  static readonly DEFAULT_INITIAL_BAND_RADIUS = 20;
  static readonly DEFAULT_MIN_BAND_MARGIN = 5;

  private algorithmFactory: HmmAlignAlgorithmFactory;
  private calculator: Calculator;
  private initialBandRadius: number;
  private bandIncrementRatio: number;
  private minBandMargin: number;
  private categoryMap: Map<string, number>;

  constructor(
    algorithmFactory: HmmAlignAlgorithmFactory,
    calculator: Calculator,
    initialBandRadius: number = AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
    bandIncrementRatio: number = AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
    minBandMargin: number = AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
    categoryMap: Map<string, number>
  ) {
    this.algorithmFactory = algorithmFactory;
    this.calculator = calculator;
    this.initialBandRadius = initialBandRadius;
    this.bandIncrementRatio = bandIncrementRatio;
    this.minBandMargin = minBandMargin;
    this.categoryMap = categoryMap;
  }

  align(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): Alignment[] {
    // Match Java: start below initial, grow on first iteration
    let bandRadius = Math.fround(this.initialBandRadius / this.bandIncrementRatio);
    let maxAlignmentRadius = Math.trunc(bandRadius) + 1;
    let result: Alignment[] = [];

    while ((maxAlignmentRadius + this.minBandMargin) > bandRadius) {
      bandRadius = Math.fround(bandRadius * this.bandIncrementRatio);
      const matrixFactory = new BandMatrixFactory(Math.trunc(bandRadius));
      const algorithm = this.algorithmFactory.createAlgorithm(
        this.calculator,
        this.categoryMap,
        matrixFactory
      );

      result = algorithm.align(sourceSegmentList, targetSegmentList);
      maxAlignmentRadius = this.calculateMaxAlignmentRadius(
        result,
        sourceSegmentList.length,
        targetSegmentList.length
      );
    }

    return result;
  }

  /**
   * Calculates maximum deviation of given alignment from diagonal
   * in the TARGET direction (matching Java's implementation).
   */
  private calculateMaxAlignmentRadius(
    alignments: Alignment[],
    sourceCount: number,
    targetCount: number
  ): number {
    let maxRadius = 0;
    let sourceNr = 0;
    let targetNr = 0;
    const targetSourceRatio = Math.fround(targetCount / sourceCount);

    for (const alignment of alignments) {
      sourceNr += alignment.sourceSegmentList.length;
      targetNr += alignment.targetSegmentList.length;

      const diagonalTargetNr = Math.trunc(Math.fround(sourceNr * targetSourceRatio));
      const radius = Math.abs(targetNr - diagonalTargetNr);
      if (radius > maxRadius) {
        maxRadius = radius;
      }
    }

    return maxRadius;
  }
}

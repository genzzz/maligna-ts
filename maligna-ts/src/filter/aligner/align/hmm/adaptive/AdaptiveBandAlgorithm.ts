import { AlignAlgorithm } from '../../AlignAlgorithm.js';
import { Alignment } from '../../../../../coretypes/Alignment.js';
import { CategoryMap, BEST_CATEGORY_MAP } from '../../../../../coretypes/CategoryDefaults.js';
import { Calculator } from '../../../../../calculator/Calculator.js';
import { BandMatrixFactory, DEFAULT_BAND_RADIUS } from '../../../../../matrix/BandMatrixFactory.js';
import { HmmAlignAlgorithmFactory } from '../HmmAlignAlgorithmFactory.js';

/**
 * Represents meta-alignment algorithm. It uses given alignment algorithm and
 * by increasing width of the diagonal band in BandMatrix tries to find
 * reasonable alignment.
 *
 * The idea is that it first creates a matrix with narrow band and performs
 * the alignment using the algorithm. It evaluates it by checking if the result
 * is not closer to the band edge than the given margin (this suggests that
 * there might be better alignment outside the band). If it is then it
 * increases the size of band and tries again. The whole process is
 * repeated until alignment is not within the margin.
 *
 * This improves overall performance of the alignment because the whole
 * matrix does not need to be calculated, just the elements on the
 * narrow band around diagonal.
 */
export class AdaptiveBandAlgorithm implements AlignAlgorithm {
  public static readonly DEFAULT_BAND_INCREMENT_RATIO = 1.5;
  public static readonly DEFAULT_INITIAL_BAND_RADIUS = DEFAULT_BAND_RADIUS;
  public static readonly DEFAULT_MIN_BAND_MARGIN =
    AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS / 4;

  private readonly categoryMap: CategoryMap;
  private readonly calculator: Calculator;
  private readonly initialBandRadius: number;
  private readonly bandIncrementRatio: number;
  private readonly minBandMargin: number;
  private readonly algorithmFactory: HmmAlignAlgorithmFactory;

  /**
   * Creates meta-algorithm.
   *
   * @param algorithmFactory factory used to create actual alignment algorithm
   * @param calculator calculator used by actual algorithm
   * @param initialBandRadius initial size of band
   * @param bandIncrementRatio the number by which the band size will be
   *    multiplied on alignment failure
   * @param minBandMargin size of margin used to evaluate an alignment
   * @param categoryMap categories used by actual algorithm
   */
  constructor(
    algorithmFactory: HmmAlignAlgorithmFactory,
    calculator: Calculator,
    initialBandRadius: number = AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
    bandIncrementRatio: number = AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
    minBandMargin: number = AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
    categoryMap: CategoryMap = BEST_CATEGORY_MAP
  ) {
    this.categoryMap = categoryMap;
    this.calculator = calculator;
    this.initialBandRadius = initialBandRadius;
    this.bandIncrementRatio = bandIncrementRatio;
    this.minBandMargin = minBandMargin;
    this.algorithmFactory = algorithmFactory;
  }

  /**
   * Creates BandMatrix with narrow band at first and increases
   * its width until it finds an alignment that does not come closer to
   * the band edge than given margin.
   */
  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[] {
    let bandRadius = this.initialBandRadius / this.bandIncrementRatio;
    let maxAlignmentRadius = Math.floor(bandRadius) + 1;
    let alignmentList: Alignment[] = [];

    while (maxAlignmentRadius + this.minBandMargin > bandRadius) {
      bandRadius *= this.bandIncrementRatio;
      const matrixFactory = new BandMatrixFactory(Math.floor(bandRadius));
      const algorithm = this.algorithmFactory.createAlignAlgorithm(
        this.calculator,
        this.categoryMap,
        matrixFactory
      );
      alignmentList = algorithm.align(sourceSegmentList, targetSegmentList);
      maxAlignmentRadius = this.calculateMaxAlignmentRadius(
        alignmentList,
        sourceSegmentList.length,
        targetSegmentList.length
      );
    }

    return alignmentList;
  }

  /**
   * Calculates maximum deviation of given alignment from diagonal
   * (can be interpreted as maximum alignment radius).
   */
  private calculateMaxAlignmentRadius(
    alignmentList: Alignment[],
    sourceCount: number,
    targetCount: number
  ): number {
    let maxRadius = 0;
    let sourceNr = 0;
    let targetNr = 0;
    const targetSourceRatio = targetCount / sourceCount;

    for (const alignment of alignmentList) {
      sourceNr += alignment.sourceSegmentList.length;
      targetNr += alignment.targetSegmentList.length;
      const diagonalTargetNr = Math.floor(sourceNr * targetSourceRatio);
      const radius = Math.abs(targetNr - diagonalTargetNr);
      if (radius > maxRadius) {
        maxRadius = radius;
      }
    }

    return maxRadius;
  }
}

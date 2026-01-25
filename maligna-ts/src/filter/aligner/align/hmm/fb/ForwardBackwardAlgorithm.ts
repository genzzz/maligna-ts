import { AlignAlgorithm } from '../../AlignAlgorithm.js';
import { Alignment } from '../../../../../coretypes/Alignment.js';
import { Category } from '../../../../../coretypes/Category.js';
import { CategoryMap } from '../../../../../coretypes/CategoryDefaults.js';
import { Calculator } from '../../../../../calculator/Calculator.js';
import { Matrix } from '../../../../../matrix/Matrix.js';
import { MatrixFactory } from '../../../../../matrix/MatrixFactory.js';
import { elementExists } from '../Util.js';
import { scoreSum } from '../../../../../util/Util.js';

/**
 * Represents alignment algorithm which uses Forward Backward algorithm.
 * In simple words it finds a path in alignment matrix (representing
 * all possible alignments) with maximum probability of each individual
 * alignment on the path.
 *
 * This algorithm is independent of method of calculating the individual
 * alignment probabilities (see Calculator) and the way the
 * matrix is iterated (some irrelevant elements may be omitted by
 * MatrixIterator, implemented by a Matrix).
 *
 * @see "A Tutorial on Hidden Markov Models and Selected
 *     Applications in Speech Recognition, Lawrence R. Rabiner"
 */
export class ForwardBackwardAlgorithm implements AlignAlgorithm {
  private readonly categoryMap: CategoryMap;
  private readonly calculator: Calculator;
  private readonly matrixFactory: MatrixFactory;

  /**
   * Creates an algorithm.
   * @param calculator probability calculator
   * @param categoryMap possible alignment categories with their probabilities
   * @param matrixFactory factory creating two dimensional matrices
   */
  constructor(
    calculator: Calculator,
    categoryMap: CategoryMap,
    matrixFactory: MatrixFactory
  ) {
    this.matrixFactory = matrixFactory;
    this.calculator = calculator;
    this.categoryMap = categoryMap;
  }

  /**
   * Consists of two phases - forward and backward, and populates forward
   * and backward matrices during these phases.
   *
   * After that retrieves the alignment list with highest individual
   * alignment probabilities.
   */
  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[] {
    // Forward pass
    const forwardMatrix = this.matrixFactory.createMatrix<number>(
      sourceSegmentList.length + 1,
      targetSegmentList.length + 1
    );

    const forwardIterator = forwardMatrix.getIterator();
    while (forwardIterator.hasNext()) {
      forwardIterator.next();
      const x = forwardIterator.x;
      const y = forwardIterator.y;
      const data = this.createForwardData(
        x,
        y,
        sourceSegmentList,
        targetSegmentList,
        forwardMatrix
      );
      forwardMatrix.set(x, y, data);
    }

    // Backward pass
    const backwardMatrix = this.matrixFactory.createMatrix<number>(
      sourceSegmentList.length + 1,
      targetSegmentList.length + 1
    );

    const backwardIterator = backwardMatrix.getIterator();
    backwardIterator.afterLast();
    while (backwardIterator.hasPrevious()) {
      backwardIterator.previous();
      const x = backwardIterator.x;
      const y = backwardIterator.y;
      const data = this.createBackwardData(
        x,
        y,
        sourceSegmentList,
        targetSegmentList,
        backwardMatrix
      );
      backwardMatrix.set(x, y, data);
    }

    // Reconstruct alignment
    const alignmentList: Alignment[] = [];
    const totalScore = forwardMatrix.get(
      sourceSegmentList.length,
      targetSegmentList.length
    );

    if (totalScore === null) {
      throw new Error('Forward matrix not properly populated');
    }

    let x = 0;
    let y = 0;

    while (x < sourceSegmentList.length || y < targetSegmentList.length) {
      let bestScore = Infinity;
      let bestCategory: Category | null = null;

      for (const entry of this.categoryMap.values()) {
        const category = entry.category;
        const newX = x + category.sourceSegmentCount;
        const newY = y + category.targetSegmentCount;

        if (newX <= sourceSegmentList.length && newY <= targetSegmentList.length) {
          const forwardScore = forwardMatrix.get(newX, newY);
          const backwardScore = backwardMatrix.get(newX, newY);

          if (forwardScore !== null && backwardScore !== null) {
            const score = forwardScore + backwardScore - totalScore;
            if (score < bestScore) {
              bestScore = score;
              bestCategory = category;
            }
          }
        }
      }

      if (bestCategory === null) {
        throw new Error('Could not find next alignment step');
      }

      const sourceList = this.createSubList(
        sourceSegmentList,
        x,
        x + bestCategory.sourceSegmentCount
      );
      const targetList = this.createSubList(
        targetSegmentList,
        y,
        y + bestCategory.targetSegmentCount
      );

      const alignment = new Alignment(sourceList, targetList, bestScore);
      alignmentList.push(alignment);

      x += bestCategory.sourceSegmentCount;
      y += bestCategory.targetSegmentCount;
    }

    return alignmentList;
  }

  /**
   * Calculates sum of probabilities (returned as score equal to
   * -ln(probability)) of all paths leading to this element.
   *
   * Matrix should be populated from upper left corner to lower right corner.
   */
  private createForwardData(
    x: number,
    y: number,
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[],
    matrix: Matrix<number>
  ): number {
    const scoreList: number[] = [];

    for (const entry of this.categoryMap.values()) {
      const category = entry.category;
      const categoryScore = entry.score;
      const startX = x - category.sourceSegmentCount;
      const startY = y - category.targetSegmentCount;

      if (elementExists(matrix, startX, startY)) {
        const sourceList = sourceSegmentList.slice(startX, x);
        const targetList = targetSegmentList.slice(startY, y);
        const score =
          categoryScore + this.calculator.calculateScore(sourceList, targetList);
        const prevScore = matrix.get(startX, startY);
        if (prevScore !== null) {
          const totalScore = score + prevScore;
          scoreList.push(totalScore);
        }
      }
    }

    return scoreSum(scoreList);
  }

  /**
   * Calculates sum of probabilities (returned as score equal to
   * -ln(probability)) of all paths leading to this element but starting
   * from the lower right corner of the matrix (backward because
   * it represents going from the back of the texts).
   *
   * Matrix should be populated from lower right corner to upper left corner.
   */
  private createBackwardData(
    x: number,
    y: number,
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[],
    matrix: Matrix<number>
  ): number {
    const scoreList: number[] = [];

    for (const entry of this.categoryMap.values()) {
      const category = entry.category;
      const categoryScore = entry.score;
      const endX = x + category.sourceSegmentCount;
      const endY = y + category.targetSegmentCount;

      if (elementExists(matrix, endX, endY)) {
        const sourceList = sourceSegmentList.slice(x, endX);
        const targetList = targetSegmentList.slice(y, endY);
        const score =
          categoryScore + this.calculator.calculateScore(sourceList, targetList);
        const nextScore = matrix.get(endX, endY);
        if (nextScore !== null) {
          const totalScore = score + nextScore;
          scoreList.push(totalScore);
        }
      }
    }

    return scoreSum(scoreList);
  }

  /**
   * Creates physical sub list.
   */
  private createSubList(
    list: readonly string[],
    start: number,
    end: number
  ): string[] {
    return [...list.slice(start, end)];
  }
}

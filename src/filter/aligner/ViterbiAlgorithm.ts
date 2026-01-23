import { Alignment } from '../../core/Alignment.js';
import { Category } from '../../core/Category.js';
import { categoryEntries } from '../../core/CategoryDefaults.js';
import { Calculator } from '../../calculator/Calculator.js';
import { Matrix, MatrixFactory } from '../../matrix/Matrix.js';
import { AlignAlgorithm } from './AlignAlgorithm.js';

/**
 * Data stored in each cell during Viterbi algorithm execution.
 */
interface ViterbiData {
  category: Category;
  score: number;
  totalScore: number;
}

/**
 * Check if a position exists in the matrix and has data.
 */
function elementExists<T>(matrix: Matrix<T>, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= matrix.width || y >= matrix.height) {
    return false;
  }
  return matrix.get(x, y) !== undefined;
}

/**
 * Viterbi alignment algorithm.
 * Finds the path in alignment matrix with maximum total probability.
 *
 * This algorithm is independent of method of calculating individual
 * alignment probabilities (see Calculator) and the way the matrix is
 * iterated (some irrelevant elements may be omitted by MatrixIterator).
 */
export class ViterbiAlgorithm implements AlignAlgorithm {
  private readonly categoryMap: Map<string, number>;
  private readonly calculator: Calculator;
  private readonly matrixFactory: MatrixFactory<ViterbiData>;

  /**
   * Creates an algorithm.
   * @param calculator probability calculator
   * @param categoryMap possible alignment categories with their scores
   * @param matrixFactory factory creating two dimensional matrices
   */
  constructor(
    calculator: Calculator,
    categoryMap: Map<string, number>,
    matrixFactory: MatrixFactory<ViterbiData>
  ) {
    this.calculator = calculator;
    this.categoryMap = categoryMap;
    this.matrixFactory = matrixFactory;
  }

  /**
   * Aligns by iterating over the matrix and populating it with ViterbiData.
   * After the matrix is populated, calls backtrace to retrieve the most
   * probable alignment.
   */
  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[] {
    const matrix = this.matrixFactory.createMatrix(
      sourceSegmentList.length + 1,
      targetSegmentList.length + 1
    );

    const iterator = matrix.getIterator();
    while (iterator.hasNext()) {
      iterator.next();
      const x = iterator.getX();
      const y = iterator.getY();
      const data = this.createData(x, y, sourceSegmentList, targetSegmentList, matrix);
      if (data) {
        matrix.set(x, y, data);
      }
    }

    return this.backtrace(sourceSegmentList, targetSegmentList, matrix);
  }

  /**
   * Creates ViterbiData object at (sourceNr, targetNr) position on the matrix.
   */
  private createData(
    sourceNr: number,
    targetNr: number,
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[],
    matrix: Matrix<ViterbiData>
  ): ViterbiData | null {
    if (sourceNr === 0 && targetNr === 0) {
      return {
        category: new Category(0, 0),
        score: 0,
        totalScore: 0,
      };
    }

    let bestCategory: Category | null = null;
    let minScore = Infinity;
    let minTotalScore = Infinity;

    for (const [category, categoryScore] of categoryEntries(this.categoryMap)) {
      const sourceStart = sourceNr - category.sourceSegmentCount;
      const targetStart = targetNr - category.targetSegmentCount;

      if (elementExists(matrix, sourceStart, targetStart)) {
        const sourceList = sourceSegmentList.slice(sourceStart, sourceNr);
        const targetList = targetSegmentList.slice(targetStart, targetNr);
        const score =
          categoryScore + this.calculator.calculateScore(sourceList, targetList);
        const prevData = matrix.get(sourceStart, targetStart)!;
        const totalScore = score + prevData.totalScore;

        if (totalScore < minTotalScore) {
          minTotalScore = totalScore;
          minScore = score;
          bestCategory = category;
        }
      }
    }

    if (bestCategory === null) {
      return null;
    }

    return {
      category: bestCategory,
      score: minScore,
      totalScore: minTotalScore,
    };
  }

  /**
   * Retrieves best alignment from populated matrix by reconstructing the
   * most probable path by iterating over it backwards.
   */
  private backtrace(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[],
    matrix: Matrix<ViterbiData>
  ): Alignment[] {
    const alignmentList: Alignment[] = [];
    let sourceIdx = sourceSegmentList.length;
    let targetIdx = targetSegmentList.length;

    while (sourceIdx > 0 || targetIdx > 0) {
      const data = matrix.get(sourceIdx, targetIdx);
      if (!data) {
        throw new Error(
          'Unable to reconstruct previously calculated alignment during backtrace.'
        );
      }

      const sourceCount = data.category.sourceSegmentCount;
      const targetCount = data.category.targetSegmentCount;

      const sourceList = sourceSegmentList.slice(
        sourceIdx - sourceCount,
        sourceIdx
      );
      const targetList = targetSegmentList.slice(
        targetIdx - targetCount,
        targetIdx
      );

      alignmentList.push(new Alignment([...sourceList], [...targetList], data.score));

      sourceIdx -= sourceCount;
      targetIdx -= targetCount;
    }

    alignmentList.reverse();
    return alignmentList;
  }
}

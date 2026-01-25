import { AlignAlgorithm } from '../../AlignAlgorithm.js';
import { Alignment } from '../../../../../coretypes/Alignment.js';
import { Category } from '../../../../../coretypes/Category.js';
import { CategoryMap } from '../../../../../coretypes/CategoryDefaults.js';
import { Calculator } from '../../../../../calculator/Calculator.js';
import { Matrix } from '../../../../../matrix/Matrix.js';
import { MatrixFactory } from '../../../../../matrix/MatrixFactory.js';
import { ViterbiData } from './ViterbiData.js';
import { elementExists } from '../Util.js';

/**
 * Represents alignment algorithm which uses Viterbi algorithm.
 * In simple words it finds a path in alignment matrix (representing
 * all possible alignments) with maximum total probability.
 *
 * This algorithm is independent of method of calculating the individual
 * alignment probabilities (see Calculator) and the way the
 * matrix is iterated (some irrelevant elements may be omitted by
 * MatrixIterator, implemented by a Matrix).
 *
 * @see "A Tutorial on Hidden Markov Models and Selected
 *     Applications in Speech Recognition, Lawrence R. Rabiner"
 */
export class ViterbiAlgorithm implements AlignAlgorithm {
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
   * Aligns by iterating over the whole matrix created by
   * MatrixFactory (iteration can omit some elements depending on
   * matrix implementation) and populating it with ViterbiData
   * elements. After the matrix is populated calls backtrace to retrieve
   * the most probable alignment from the matrix.
   */
  align(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): Alignment[] {
    const matrix = this.matrixFactory.createMatrix<ViterbiData>(
      sourceSegmentList.length + 1,
      targetSegmentList.length + 1
    );

    const iterator = matrix.getIterator();
    while (iterator.hasNext()) {
      iterator.next();
      const x = iterator.x;
      const y = iterator.y;
      const data = this.createData(
        x,
        y,
        sourceSegmentList,
        targetSegmentList,
        matrix
      );
      if (data !== null) {
        matrix.set(x, y, data);
      }
    }

    return this.backtrace(sourceSegmentList, targetSegmentList, matrix);
  }

  /**
   * Creates ViterbiData object at (sourceNr, targetNr) position
   * on the matrix. To do it calculates most probable path to this element
   * by checking all possible ways (categories) to reach it from previously
   * calculated data objects (to the left or up, because they are calculated
   * before current one) and adds new alignment score
   * (calculated with Calculator).
   *
   * When sourceNr == 0 and targetNr == 0 (upper left corner),
   * then zero-to-zero category alignment is created.
   * Does not insert created object into the matrix.
   */
  private createData(
    sourceNr: number,
    targetNr: number,
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[],
    matrix: Matrix<ViterbiData>
  ): ViterbiData | null {
    if (sourceNr === 0 && targetNr === 0) {
      return new ViterbiData(new Category(0, 0), 0, 0);
    }

    let bestCategory: Category | null = null;
    let minScore = Infinity;
    let minTotalScore = Infinity;

    for (const entry of this.categoryMap.values()) {
      const category = entry.category;
      const categoryScore = entry.score;
      const sourceStart = sourceNr - category.sourceSegmentCount;
      const targetStart = targetNr - category.targetSegmentCount;

      if (elementExists(matrix, sourceStart, targetStart)) {
        const sourceList = sourceSegmentList.slice(sourceStart, sourceNr);
        const targetList = targetSegmentList.slice(targetStart, targetNr);
        const score =
          categoryScore + this.calculator.calculateScore(sourceList, targetList);
        const prevData = matrix.get(sourceStart, targetStart);
        if (prevData === null) continue;
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
    } else {
      return new ViterbiData(bestCategory, minScore, minTotalScore);
    }
  }

  /**
   * Retrieves best alignment from populated matrix by reconstructing the
   * most probable path by iterating over it backwards and always selecting
   * the most probable alignment.
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
      if (data === null) {
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

      const alignment = new Alignment([...sourceList], [...targetList], data.score);
      alignmentList.push(alignment);

      sourceIdx -= sourceCount;
      targetIdx -= targetCount;
    }

    alignmentList.reverse();
    return alignmentList;
  }
}

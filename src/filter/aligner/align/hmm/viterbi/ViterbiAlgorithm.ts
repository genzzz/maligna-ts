import { Calculator } from '../../../../../calculator/Calculator';
import { Matrix, MatrixFactory } from '../../../../../matrix/Matrix';
import { AlignAlgorithm } from '../../AlignAlgorithm';
import { Alignment } from '../../../../../coretypes/Alignment';
import { Category } from '../../../../../coretypes/Category';
import { getCategoryEntries } from '../hmmUtil';
import { CategoryEntry } from '../../../../../coretypes/CategoryDefaults';

/**
 * Data stored at each position in the Viterbi matrix.
 */
export class ViterbiData {
  public category: Category | null = null;
  public score: number = 0;
  public totalScore: number = Infinity;
}

/**
 * Viterbi alignment algorithm using dynamic programming.
 * Finds the most probable complete alignment path.
 */
export class ViterbiAlgorithm implements AlignAlgorithm {
  private calculator: Calculator;
  private categoryMap: Map<string, number>;
  private matrixFactory: MatrixFactory<ViterbiData>;

  constructor(
    calculator: Calculator,
    categoryMap: Map<string, number>,
    matrixFactory: MatrixFactory<ViterbiData>
  ) {
    this.calculator = calculator;
    this.categoryMap = categoryMap;
    this.matrixFactory = matrixFactory;
  }

  align(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): Alignment[] {
    const width = sourceSegmentList.length + 1;
    const height = targetSegmentList.length + 1;
    const matrix = this.matrixFactory.createMatrix(width, height);
    const categoryEntries = getCategoryEntries(this.categoryMap);

    this.createData(matrix, sourceSegmentList, targetSegmentList, categoryEntries);
    return this.backtrace(matrix, sourceSegmentList, targetSegmentList);
  }

  private createData(
    matrix: Matrix<ViterbiData>,
    sourceSegmentList: string[],
    targetSegmentList: string[],
    categoryEntries: CategoryEntry[]
  ): void {
    const iterator = matrix.getIterator();
    iterator.beforeFirst();

    while (iterator.hasNext()) {
      const [x, y] = iterator.next();
      const data = new ViterbiData();

      if (x === 0 && y === 0) {
        data.totalScore = 0;
      } else {
        let bestTotalScore = Infinity;
        let bestCategory: Category | null = null;
        let bestScore = Infinity;

        for (let ci = 0; ci < categoryEntries.length; ci++) {
          const entry = categoryEntries[ci];
          const cat = entry.category;
          const prevX = x - cat.sourceSegmentCount;
          const prevY = y - cat.targetSegmentCount;

          if (prevX < 0 || prevY < 0) continue;

          const prevData = matrix.get(prevX, prevY);
          if (!prevData || prevData.totalScore === Infinity) continue;

          const sourceSubList = sourceSegmentList.slice(prevX, x);
          const targetSubList = targetSegmentList.slice(prevY, y);

          const calculatorScore = this.calculator.calculateScore(
            sourceSubList,
            targetSubList
          );
          // Java: float score = categoryScore + calculator.calculateScore(...)
          const score = Math.fround(entry.score + calculatorScore);
          // Java: float totalScore = score + matrix.get(...).getTotalScore()
          const totalScore = Math.fround(prevData.totalScore + score);

          if (totalScore < bestTotalScore) {
            bestTotalScore = totalScore;
            bestCategory = cat;
            bestScore = score;
          }
        }

        data.totalScore = bestTotalScore;
        data.category = bestCategory;
        data.score = bestScore;
      }

      matrix.set(x, y, data);
    }
  }

  private backtrace(
    matrix: Matrix<ViterbiData>,
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): Alignment[] {
    const alignments: Alignment[] = [];
    let x = sourceSegmentList.length;
    let y = targetSegmentList.length;

    while (x > 0 || y > 0) {
      const data = matrix.get(x, y);
      if (!data || !data.category) break;

      const category = data.category;
      const prevX = x - category.sourceSegmentCount;
      const prevY = y - category.targetSegmentCount;

      const sourceSubList = sourceSegmentList.slice(prevX, x);
      const targetSubList = targetSegmentList.slice(prevY, y);

      alignments.push(new Alignment(sourceSubList, targetSubList, data.score));

      x = prevX;
      y = prevY;
    }

    alignments.reverse();
    return alignments;
  }
}

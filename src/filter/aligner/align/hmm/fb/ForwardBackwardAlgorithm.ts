import { Calculator } from '../../../../../calculator/Calculator';
import { Matrix, MatrixFactory } from '../../../../../matrix/Matrix';
import { AlignAlgorithm } from '../../AlignAlgorithm';
import { Alignment } from '../../../../../coretypes/Alignment';
import { Category } from '../../../../../coretypes/Category';
import { getCategoryEntries } from '../hmmUtil';
import { CategoryEntry } from '../../../../../coretypes/CategoryDefaults';

/**
 * Forward-Backward alignment algorithm.
 *
 * Performs two passes (forward and backward) to compute the probability
 * of each alignment at each position. Then selects alignments with the
 * best individual probabilities (not necessarily the best path).
 */
export class ForwardBackwardAlgorithm implements AlignAlgorithm {
  private calculator: Calculator;
  private categoryMap: Map<string, number>;
  private matrixFactory: MatrixFactory<number>;

  constructor(
    calculator: Calculator,
    categoryMap: Map<string, number>,
    matrixFactory: MatrixFactory<number>
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
    const categoryEntries = getCategoryEntries(this.categoryMap);

    // Forward pass
    const forwardMatrix = this.matrixFactory.createMatrix(width, height);
    this.forwardPass(forwardMatrix, sourceSegmentList, targetSegmentList, categoryEntries);

    // Backward pass
    const backwardMatrix = this.matrixFactory.createMatrix(width, height);
    this.backwardPass(backwardMatrix, sourceSegmentList, targetSegmentList, categoryEntries);

    // Select best alignments
    return this.selectAlignments(
      forwardMatrix,
      backwardMatrix,
      sourceSegmentList,
      targetSegmentList,
      categoryEntries
    );
  }

  private forwardPass(
    matrix: Matrix<number>,
    sourceSegmentList: string[],
    targetSegmentList: string[],
    categoryEntries: CategoryEntry[]
  ): void {
    const iterator = matrix.getIterator();
    iterator.beforeFirst();
    // Pre-allocate score buffer (max category count)
    const scoreBuffer = new Float64Array(categoryEntries.length);

    while (iterator.hasNext()) {
      const [x, y] = iterator.next();

      if (x === 0 && y === 0) {
        matrix.set(x, y, 0); // score 0 = probability 1
        continue;
      }

      let scoreCount = 0;

      for (let ci = 0; ci < categoryEntries.length; ci++) {
        const entry = categoryEntries[ci];
        const cat = entry.category;
        const prevX = x - cat.sourceSegmentCount;
        const prevY = y - cat.targetSegmentCount;

        if (prevX < 0 || prevY < 0) continue;

        const prevScore = matrix.get(prevX, prevY);
        if (prevScore === null || prevScore === Infinity) continue;

        const sourceSubList = sourceSegmentList.slice(prevX, x);
        const targetSubList = targetSegmentList.slice(prevY, y);

        const calculatorScore = this.calculator.calculateScore(
          sourceSubList,
          targetSubList
        );
        scoreBuffer[scoreCount++] = prevScore + entry.score + calculatorScore;
      }

      if (scoreCount > 0) {
        matrix.set(x, y, scoreSumBuffer(scoreBuffer, scoreCount));
      } else {
        matrix.set(x, y, Infinity);
      }
    }
  }

  private backwardPass(
    matrix: Matrix<number>,
    sourceSegmentList: string[],
    targetSegmentList: string[],
    categoryEntries: CategoryEntry[]
  ): void {
    const width = sourceSegmentList.length;
    const height = targetSegmentList.length;

    const iterator = matrix.getIterator();
    iterator.afterLast();
    const scoreBuffer = new Float64Array(categoryEntries.length);

    while (iterator.hasPrevious()) {
      const [x, y] = iterator.previous();

      if (x === width && y === height) {
        matrix.set(x, y, 0); // score 0 = probability 1
        continue;
      }

      let scoreCount = 0;

      for (let ci = 0; ci < categoryEntries.length; ci++) {
        const entry = categoryEntries[ci];
        const cat = entry.category;
        const nextX = x + cat.sourceSegmentCount;
        const nextY = y + cat.targetSegmentCount;

        if (nextX > width || nextY > height) continue;

        const nextScore = matrix.get(nextX, nextY);
        if (nextScore === null || nextScore === Infinity) continue;

        const sourceSubList = sourceSegmentList.slice(x, nextX);
        const targetSubList = targetSegmentList.slice(y, nextY);

        const calculatorScore = this.calculator.calculateScore(
          sourceSubList,
          targetSubList
        );
        scoreBuffer[scoreCount++] = nextScore + entry.score + calculatorScore;
      }

      if (scoreCount > 0) {
        matrix.set(x, y, scoreSumBuffer(scoreBuffer, scoreCount));
      } else {
        matrix.set(x, y, Infinity);
      }
    }
  }

  private selectAlignments(
    forwardMatrix: Matrix<number>,
    backwardMatrix: Matrix<number>,
    sourceSegmentList: string[],
    targetSegmentList: string[],
    categoryEntries: CategoryEntry[]
  ): Alignment[] {
    const width = sourceSegmentList.length;
    const height = targetSegmentList.length;

    // Total score (normalizing constant)
    const totalScore = forwardMatrix.get(width, height);
    if (totalScore === null || totalScore === Infinity) {
      return [];
    }

    const alignments: Alignment[] = [];
    let x = 0;
    let y = 0;

    while (x < width || y < height) {
      let bestScore = Infinity;
      let bestCategory: Category | null = null;
      let bestAlignmentScore = Infinity;

      for (let ci = 0; ci < categoryEntries.length; ci++) {
        const entry = categoryEntries[ci];
        const cat = entry.category;
        const nextX = x + cat.sourceSegmentCount;
        const nextY = y + cat.targetSegmentCount;

        if (nextX > width || nextY > height) continue;

        const forwardScore = forwardMatrix.get(x, y);
        const backwardScore = backwardMatrix.get(nextX, nextY);

        if (
          forwardScore === null ||
          forwardScore === Infinity ||
          backwardScore === null ||
          backwardScore === Infinity
        )
          continue;

        const sourceSubList = sourceSegmentList.slice(x, nextX);
        const targetSubList = targetSegmentList.slice(y, nextY);

        const calculatorScore = this.calculator.calculateScore(
          sourceSubList,
          targetSubList
        );
        const alignScore = entry.score + calculatorScore;
        const combinedScore =
          forwardScore + alignScore + backwardScore - totalScore;

        if (combinedScore < bestScore) {
          bestScore = combinedScore;
          bestCategory = cat;
          bestAlignmentScore = alignScore;
        }
      }

      if (!bestCategory) break;

      const sourceSubList = sourceSegmentList.slice(
        x,
        x + bestCategory.sourceSegmentCount
      );
      const targetSubList = targetSegmentList.slice(
        y,
        y + bestCategory.targetSegmentCount
      );

      alignments.push(
        new Alignment(sourceSubList, targetSubList, bestAlignmentScore)
      );

      x += bestCategory.sourceSegmentCount;
      y += bestCategory.targetSegmentCount;
    }

    return alignments;
  }
}

/**
 * Log-sum-exp from a pre-allocated buffer with a count.
 * Avoids allocating a new array per cell.
 */
function scoreSumBuffer(buffer: Float64Array, count: number): number {
  if (count === 0) return Infinity;
  if (count === 1) return buffer[0];

  let minScore = buffer[0];
  for (let i = 1; i < count; i++) {
    if (buffer[i] < minScore) minScore = buffer[i];
  }

  if (minScore === Infinity) return Infinity;

  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += Math.exp(minScore - buffer[i]);
  }

  return minScore - Math.log(sum);
}

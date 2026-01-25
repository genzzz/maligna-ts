import { Matrix } from './Matrix.js';
import { MatrixIterator } from './MatrixIterator.js';
import { FullMatrixIterator } from './FullMatrixIterator.js';

/**
 * Represents a two-dimensional matrix that contains all the elements.
 * This matrix uses standard two-dimensional array and occupies
 * row number * column number memory,
 * which can be quite memory inefficient for sparse matrices.
 * On the other hand element access should be fast with this matrix.
 */
export class FullMatrix<T> implements Matrix<T> {
  private readonly dataArray: (T | null)[][];
  private readonly _width: number;
  private readonly _height: number;

  /**
   * Creates a matrix.
   * @param width matrix width (number of columns), >= 1.
   * @param height matrix height (number of rows), >= 1.
   */
  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    this.dataArray = new Array(width);
    for (let x = 0; x < width; x++) {
      this.dataArray[x] = new Array(height).fill(null);
    }
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get size(): number {
    return this._width * this._height;
  }

  get(x: number, y: number): T | null {
    const col = this.dataArray[x];
    if (col === undefined) return null;
    return col[y] ?? null;
  }

  set(x: number, y: number, data: T): void {
    const col = this.dataArray[x];
    if (col !== undefined) {
      col[y] = data;
    }
  }

  getIterator(): MatrixIterator<T> {
    return new FullMatrixIterator(this);
  }
}

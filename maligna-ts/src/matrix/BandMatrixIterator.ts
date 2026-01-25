import { MatrixIterator } from './MatrixIterator.js';
import { BandMatrix } from './BandMatrix.js';

/**
 * Represents BandMatrix iterator.
 */
export class BandMatrixIterator<T> implements MatrixIterator<T> {
  private readonly matrix: BandMatrix<T>;
  private _x: number = -1;
  private _y: number = 0;
  private maxX: number = 0;
  private minX: number = 0;

  constructor(matrix: BandMatrix<T>) {
    this.matrix = matrix;
    this.beforeFirst();
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  beforeFirst(): void {
    this._x = -1;
    this._y = 0;
    this.calculateMinMaxX();
  }

  hasNext(): boolean {
    return !(
      this._y >= this.matrix.height - 1 && this._x >= this.matrix.width - 1
    );
  }

  next(): void {
    ++this._x;
    if (this._x > this.maxX) {
      ++this._y;
      this.calculateMinMaxX();
      this._x = this.minX;
      if (this._y >= this.matrix.height) {
        throw new Error('NoSuchElementException: No more elements');
      }
    }
  }

  afterLast(): void {
    this._x = this.matrix.width;
    this._y = this.matrix.height - 1;
    this.calculateMinMaxX();
  }

  hasPrevious(): boolean {
    return !(this._y <= 0 && this._x <= 0);
  }

  previous(): void {
    --this._x;
    if (this._x < this.minX) {
      --this._y;
      this.calculateMinMaxX();
      this._x = this.maxX;
      if (this._y < 0) {
        throw new Error('NoSuchElementException: No previous elements');
      }
    }
  }

  /**
   * Calculates minimum and maximum x position (column number) at current
   * y position (row number) and stores them in minX and maxX.
   */
  private calculateMinMaxX(): void {
    const diagonalX = this.matrix.getDiagonalX(this._y);
    this.minX = Math.max(0, diagonalX - this.matrix.bandRadius);
    this.maxX = Math.min(
      this.matrix.width - 1,
      diagonalX + this.matrix.bandRadius
    );
  }
}

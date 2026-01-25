import { MatrixIterator } from './MatrixIterator.js';
import { FullMatrix } from './FullMatrix.js';

/**
 * Represents FullMatrix iterator.
 */
export class FullMatrixIterator<T> implements MatrixIterator<T> {
  private readonly matrix: FullMatrix<T>;
  private _x: number = -1;
  private _y: number = 0;

  constructor(matrix: FullMatrix<T>) {
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
  }

  hasNext(): boolean {
    return !(
      this._y >= this.matrix.height - 1 && this._x >= this.matrix.width - 1
    );
  }

  next(): void {
    ++this._x;
    if (this._x >= this.matrix.width) {
      ++this._y;
      this._x = 0;
      if (this._y >= this.matrix.height) {
        throw new Error('NoSuchElementException: No more elements');
      }
    }
  }

  afterLast(): void {
    this._x = this.matrix.width;
    this._y = this.matrix.height - 1;
  }

  hasPrevious(): boolean {
    return !(this._y <= 0 && this._x <= 0);
  }

  previous(): void {
    --this._x;
    if (this._x < 0) {
      --this._y;
      this._x = this.matrix.width - 1;
      if (this._y < 0) {
        throw new Error('NoSuchElementException: No previous elements');
      }
    }
  }
}

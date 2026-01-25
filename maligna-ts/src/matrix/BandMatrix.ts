import { Matrix } from './Matrix.js';
import { MatrixIterator } from './MatrixIterator.js';
import { BandMatrixIterator } from './BandMatrixIterator.js';

/**
 * Represents matrix that stores only elements within given radius around
 * the diagonal.
 *
 * This way the required memory is reduced to height * band width.
 * For example:
 * [X represents stored elements, 0 represents not stored elements.]
 *
 * XX000
 * XXX00
 * 0XXX0
 * 00XXX
 * 000XX
 *
 * If user tries to access element outside band then
 * PositionOutsideBandException will be thrown. Matrix iterator
 * (BandMatrixIterator) iterates only on the elements inside band.
 */
export class BandMatrix<T> implements Matrix<T> {
  private readonly dataArray: (T | null)[][];
  private readonly _width: number;
  private readonly _height: number;
  private readonly _bandWidth: number;
  private readonly _bandRadius: number;
  private readonly widthHeightRatio: number;

  /**
   * Creates matrix.
   * @param width width of matrix (columns), >= 1
   * @param height height of matrix (rows), >= 1
   * @param bandRadius radius
   */
  constructor(width: number, height: number, bandRadius: number) {
    if (bandRadius < 1) {
      throw new Error('Band radius must be >= 1');
    }
    this._width = width;
    this._height = height;
    this._bandRadius = bandRadius;
    this._bandWidth = bandRadius * 2 + 1;
    this.widthHeightRatio = width / height;

    this.dataArray = new Array(this._bandWidth);
    for (let x = 0; x < this._bandWidth; x++) {
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
    return (
      this._bandWidth * this._height -
      Math.floor(this._bandRadius * this._bandRadius * this.widthHeightRatio)
    );
  }

  get bandRadius(): number {
    return this._bandRadius;
  }

  get(x: number, y: number): T | null {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      return null;
    }
    const actualX = this.getActualX(x, y);
    if (actualX >= 0 && actualX < this._bandWidth) {
      const col = this.dataArray[actualX];
      return col !== undefined ? (col[y] ?? null) : null;
    } else {
      return null;
    }
  }

  set(x: number, y: number, data: T): void {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      throw new Error(
        `Position (${x}, ${y}) out of bounds for matrix ${this._width}x${this._height}`
      );
    }
    const actualX = this.getActualX(x, y);
    if (actualX >= 0 && actualX < this._bandWidth) {
      const col = this.dataArray[actualX];
      if (col !== undefined) {
        col[y] = data;
      }
    } else {
      throw new Error(
        `PositionOutsideBandException: Position (${x}, ${y}) is outside band of width ${this._bandWidth}`
      );
    }
  }

  /**
   * Gets the x position on the diagonal corresponding to given y position.
   * Used by BandMatrixIterator.
   * @param y y position (row number)
   * @returns x position (column number) of the element on the diagonal
   *    at given y position (row number)
   */
  getDiagonalX(y: number): number {
    return Math.floor(y * this.widthHeightRatio);
  }

  /**
   * @param x x position (column number)
   * @param y y position (row number)
   * @returns gets the x position of element in the storage data array
   *    corresponding to x, y positions in the abstract matrix
   */
  private getActualX(x: number, y: number): number {
    return x - this.getDiagonalX(y) + this._bandRadius;
  }

  getIterator(): MatrixIterator<T> {
    return new BandMatrixIterator(this);
  }
}

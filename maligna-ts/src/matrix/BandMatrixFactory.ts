import { Matrix } from './Matrix.js';
import { BandMatrix } from './BandMatrix.js';
import { MatrixFactory } from './MatrixFactory.js';

export const DEFAULT_BAND_RADIUS = 20;

/**
 * Represents BandMatrix factory.
 * Responsible for creating BandMatrix objects.
 */
export class BandMatrixFactory implements MatrixFactory {
  private readonly bandRadius: number;

  /**
   * Creates band matrix factory producing matrices with given radius.
   */
  constructor(bandRadius: number = DEFAULT_BAND_RADIUS) {
    this.bandRadius = bandRadius;
  }

  createMatrix<T>(width: number, height: number): Matrix<T> {
    return new BandMatrix<T>(width, height, this.bandRadius);
  }
}

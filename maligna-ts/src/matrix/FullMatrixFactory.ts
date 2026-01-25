import { Matrix } from './Matrix.js';
import { FullMatrix } from './FullMatrix.js';
import { MatrixFactory } from './MatrixFactory.js';

/**
 * Represents FullMatrix factory.
 * Responsible for creating FullMatrix objects.
 */
export class FullMatrixFactory implements MatrixFactory {
  createMatrix<T>(width: number, height: number): Matrix<T> {
    return new FullMatrix<T>(width, height);
  }
}

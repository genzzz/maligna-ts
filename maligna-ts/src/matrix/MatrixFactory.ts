import { Matrix } from './Matrix.js';

/**
 * Represents matrix factory.
 * Enables to create a matrix of given size without knowing the actual
 * matrix type.
 */
export interface MatrixFactory {
  createMatrix<T>(width: number, height: number): Matrix<T>;
}

import { Matrix } from '../../../../matrix/Matrix.js';

/**
 * Represents alignment algorithm utilities.
 */

/**
 * Checks if x (y) is greater than 0 and less than matrix width (height)
 * and if the element stored at this position is not null.
 */
export function elementExists<T>(matrix: Matrix<T>, x: number, y: number): boolean {
  return (
    x >= 0 &&
    y >= 0 &&
    x < matrix.width &&
    y < matrix.height &&
    matrix.get(x, y) !== null
  );
}

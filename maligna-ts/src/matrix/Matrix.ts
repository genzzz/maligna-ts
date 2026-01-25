import { MatrixIterator } from './MatrixIterator.js';

/**
 * Represents generic abstract two-dimensional matrix.
 * Useful because dimensions can be big but the data is usually sparse,
 * so more sophisticated implementations than normal two-dimensional array
 * are desired.
 */
export interface Matrix<T> {
  /**
   * @returns matrix width (number of columns)
   */
  readonly width: number;

  /**
   * @returns matrix height (number of rows)
   */
  readonly height: number;

  /**
   * @returns real matrix size (number of stored elements, <= width * height)
   */
  readonly size: number;

  /**
   * Returns matrix element at given position.
   * @param x column
   * @param y row
   * @returns element or null/undefined if not present
   */
  get(x: number, y: number): T | null;

  /**
   * Sets the matrix element at given position.
   * @param x column
   * @param y row
   * @param data element
   */
  set(x: number, y: number, data: T): void;

  /**
   * @returns matrix iterator that will iterate over whole matrix
   *    from top left to bottom right corner.
   */
  getIterator(): MatrixIterator<T>;
}

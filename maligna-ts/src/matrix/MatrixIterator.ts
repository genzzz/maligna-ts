/**
 * Represents generic matrix iterator.
 * Iterates the matrix from top left to bottom right corner, increasing
 * column number first, and if it reaches maximum increasing row number.
 * Some of the elements on the matrix may be ignored if it does not
 * store them, but the overall order must be preserved.
 * Also enables iterating the matrix in reverse order.
 */
export interface MatrixIterator<_T> {
  /**
   * @returns x position of the iterator (column)
   */
  readonly x: number;

  /**
   * @returns y position of the iterator (row)
   */
  readonly y: number;

  /**
   * Resets the iterator - sets its position to before first element.
   */
  beforeFirst(): void;

  /**
   * @returns true if iterator has next element (hasn't reached bottom right corner)
   */
  hasNext(): boolean;

  /**
   * Advances the iterator to the next element. If this is not possible
   * because iterator hasn't got the next element, it throws an error.
   */
  next(): void;

  /**
   * Sets the position to after last element - subsequent calls to
   * hasNext() will return false.
   */
  afterLast(): void;

  /**
   * @returns true if iterator has previous element (hasn't reached top left corner).
   */
  hasPrevious(): boolean;

  /**
   * Moves the iterator to the previous element. If this is not possible
   * because iterator hasn't got the previous element, it throws an error.
   */
  previous(): void;
}

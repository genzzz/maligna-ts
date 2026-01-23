/**
 * Iterator over matrix elements.
 */
export interface MatrixIterator<T> {
  hasNext(): boolean;
  next(): T | undefined;
  getX(): number;
  getY(): number;
}

/**
 * Represents generic abstract two-dimensional matrix.
 * Useful because dimensions can be big but the data is usually sparse.
 */
export interface Matrix<T> {
  /**
   * Matrix width (number of columns)
   */
  readonly width: number;

  /**
   * Matrix height (number of rows)
   */
  readonly height: number;

  /**
   * Real matrix size (number of stored elements)
   */
  readonly size: number;

  /**
   * Returns matrix element at given position.
   */
  get(x: number, y: number): T | undefined;

  /**
   * Sets the matrix element at given position.
   */
  set(x: number, y: number, data: T): void;

  /**
   * Returns iterator that will iterate over whole matrix.
   */
  getIterator(): MatrixIterator<T>;
}

/**
 * Factory for creating matrices.
 */
export interface MatrixFactory<T> {
  createMatrix(width: number, height: number): Matrix<T>;
}

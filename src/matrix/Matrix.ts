/**
 * Iterator over matrix positions supporting forward and backward traversal.
 */
export interface MatrixIterator {
  hasNext(): boolean;
  next(): [number, number];
  hasPrevious(): boolean;
  previous(): [number, number];
  beforeFirst(): void;
  afterLast(): void;
}

/**
 * 2D matrix interface used by alignment algorithms.
 */
export interface Matrix<T> {
  get(x: number, y: number): T | null;
  set(x: number, y: number, data: T): void;
  getWidth(): number;
  getHeight(): number;
  getSize(): number;
  getIterator(): MatrixIterator;
}

/**
 * Factory for creating matrices.
 */
export interface MatrixFactory<T> {
  createMatrix(width: number, height: number): Matrix<T>;
}

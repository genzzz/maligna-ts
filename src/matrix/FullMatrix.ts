import { Matrix, MatrixFactory, MatrixIterator } from './Matrix';

/**
 * Full matrix implementation using a 2D array.
 * Stores all elements regardless of position.
 */
export class FullMatrix<T> implements Matrix<T> {
  private data: (T | null)[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Array(width);
    for (let x = 0; x < width; x++) {
      this.data[x] = new Array(height).fill(null);
    }
  }

  get(x: number, y: number): T | null {
    return this.data[x][y];
  }

  set(x: number, y: number, data: T): void {
    this.data[x][y] = data;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getSize(): number {
    return this.width * this.height;
  }

  getIterator(): MatrixIterator {
    return new FullMatrixIterator(this.width, this.height);
  }
}

export class FullMatrixIterator implements MatrixIterator {
  private width: number;
  private height: number;
  private x: number;
  private y: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.x = -1;
    this.y = 0;
  }

  hasNext(): boolean {
    return this.x < this.width - 1 || this.y < this.height - 1;
  }

  next(): [number, number] {
    this.x++;
    if (this.x >= this.width) {
      this.x = 0;
      this.y++;
    }
    return [this.x, this.y];
  }

  hasPrevious(): boolean {
    return this.x > 0 || this.y > 0;
  }

  previous(): [number, number] {
    this.x--;
    if (this.x < 0) {
      this.x = this.width - 1;
      this.y--;
    }
    return [this.x, this.y];
  }

  beforeFirst(): void {
    this.x = -1;
    this.y = 0;
  }

  afterLast(): void {
    this.x = this.width;
    this.y = this.height - 1;
  }
}

export class FullMatrixFactory<T> implements MatrixFactory<T> {
  createMatrix(width: number, height: number): Matrix<T> {
    return new FullMatrix<T>(width, height);
  }
}

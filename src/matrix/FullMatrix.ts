import { Matrix, MatrixIterator, MatrixFactory } from './Matrix.js';

/**
 * Iterator for FullMatrix.
 */
class FullMatrixIterator<T> implements MatrixIterator<T> {
  private matrix: FullMatrix<T>;
  private x: number = 0;
  private y: number = 0;
  private started: boolean = false;

  constructor(matrix: FullMatrix<T>) {
    this.matrix = matrix;
  }

  hasNext(): boolean {
    if (!this.started) {
      return this.matrix.width > 0 && this.matrix.height > 0;
    }
    const nextX = this.x + 1;
    if (nextX < this.matrix.width) {
      return true;
    }
    return this.y + 1 < this.matrix.height;
  }

  next(): T | undefined {
    if (!this.started) {
      this.started = true;
      return this.matrix.get(0, 0);
    }
    this.x++;
    if (this.x >= this.matrix.width) {
      this.x = 0;
      this.y++;
    }
    return this.matrix.get(this.x, this.y);
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}

/**
 * Full matrix implementation storing all elements.
 */
export class FullMatrix<T> implements Matrix<T> {
  private data: (T | undefined)[][];
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Array(height);
    for (let y = 0; y < height; y++) {
      this.data[y] = new Array(width);
    }
  }

  get size(): number {
    return this.width * this.height;
  }

  get(x: number, y: number): T | undefined {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }
    return this.data[y][x];
  }

  set(x: number, y: number, data: T): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.data[y][x] = data;
    }
  }

  getIterator(): MatrixIterator<T> {
    return new FullMatrixIterator(this);
  }
}

/**
 * Factory for creating FullMatrix instances.
 */
export class FullMatrixFactory<T> implements MatrixFactory<T> {
  createMatrix(width: number, height: number): Matrix<T> {
    return new FullMatrix<T>(width, height);
  }
}

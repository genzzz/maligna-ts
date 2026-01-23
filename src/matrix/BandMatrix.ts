import { Matrix, MatrixIterator, MatrixFactory } from './Matrix.js';

/**
 * Iterator for BandMatrix - only iterates over the diagonal band.
 */
class BandMatrixIterator<T> implements MatrixIterator<T> {
  private matrix: BandMatrix<T>;
  private x: number = 0;
  private y: number = 0;
  private started: boolean = false;

  constructor(matrix: BandMatrix<T>) {
    this.matrix = matrix;
  }

  hasNext(): boolean {
    if (!this.started) {
      return this.matrix.width > 0 && this.matrix.height > 0;
    }

    // Try to find next valid position
    let nextX = this.x + 1;
    let nextY = this.y;

    while (nextY < this.matrix.height) {
      if (nextX < this.matrix.width && this.matrix.isInBand(nextX, nextY)) {
        return true;
      }
      nextX++;
      if (nextX >= this.matrix.width || !this.matrix.isInBand(nextX, nextY)) {
        nextX = 0;
        nextY++;
        // Skip to first valid x in new row
        while (
          nextX < this.matrix.width &&
          !this.matrix.isInBand(nextX, nextY)
        ) {
          nextX++;
        }
      }
    }
    return false;
  }

  next(): T | undefined {
    if (!this.started) {
      this.started = true;
      // Find first valid position
      while (!this.matrix.isInBand(this.x, this.y)) {
        this.x++;
        if (this.x >= this.matrix.width) {
          this.x = 0;
          this.y++;
        }
      }
      return this.matrix.get(this.x, this.y);
    }

    // Move to next position
    this.x++;
    while (this.y < this.matrix.height) {
      if (this.x < this.matrix.width && this.matrix.isInBand(this.x, this.y)) {
        return this.matrix.get(this.x, this.y);
      }
      this.x++;
      if (this.x >= this.matrix.width || !this.matrix.isInBand(this.x, this.y)) {
        this.x = 0;
        this.y++;
        while (
          this.x < this.matrix.width &&
          !this.matrix.isInBand(this.x, this.y)
        ) {
          this.x++;
        }
      }
    }
    return undefined;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}

/**
 * Band matrix that only stores elements along the diagonal.
 * Memory efficient for large matrices with sparse diagonal access.
 */
export class BandMatrix<T> implements Matrix<T> {
  private data: Map<string, T> = new Map();
  readonly width: number;
  readonly height: number;
  private readonly bandRadius: number;
  private readonly slope: number;

  constructor(width: number, height: number, bandRadius: number) {
    this.width = width;
    this.height = height;
    this.bandRadius = bandRadius;
    this.slope = height > 1 ? (width - 1) / (height - 1) : 1;
  }

  private key(x: number, y: number): string {
    return `${x},${y}`;
  }

  get size(): number {
    // Approximate band size
    const avgWidth = Math.min(this.width, 2 * this.bandRadius + 1);
    return avgWidth * this.height;
  }

  isInBand(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    const diagonal = y * this.slope;
    return Math.abs(x - diagonal) <= this.bandRadius;
  }

  get(x: number, y: number): T | undefined {
    if (!this.isInBand(x, y)) {
      return undefined;
    }
    return this.data.get(this.key(x, y));
  }

  set(x: number, y: number, data: T): void {
    if (this.isInBand(x, y)) {
      this.data.set(this.key(x, y), data);
    }
  }

  getIterator(): MatrixIterator<T> {
    return new BandMatrixIterator(this);
  }
}

/**
 * Factory for creating BandMatrix instances.
 */
export class BandMatrixFactory<T> implements MatrixFactory<T> {
  private readonly bandRadius: number;

  constructor(bandRadius: number = 50) {
    this.bandRadius = bandRadius;
  }

  createMatrix(width: number, height: number): Matrix<T> {
    return new BandMatrix<T>(width, height, this.bandRadius);
  }
}

/**
 * Adaptive band factory that adjusts band size based on matrix dimensions.
 */
export class AdaptiveBandMatrixFactory<T> implements MatrixFactory<T> {
  private bandRadius: number;
  private readonly minRadius: number;
  private readonly maxRadius: number;
  private readonly radiusStep: number;

  constructor(
    initialRadius: number = 50,
    minRadius: number = 20,
    maxRadius: number = 500,
    radiusStep: number = 50
  ) {
    this.bandRadius = initialRadius;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.radiusStep = radiusStep;
  }

  createMatrix(width: number, height: number): Matrix<T> {
    return new BandMatrix<T>(width, height, this.bandRadius);
  }

  increaseRadius(): boolean {
    if (this.bandRadius < this.maxRadius) {
      this.bandRadius = Math.min(
        this.bandRadius + this.radiusStep,
        this.maxRadius
      );
      return true;
    }
    return false;
  }

  decreaseRadius(): boolean {
    if (this.bandRadius > this.minRadius) {
      this.bandRadius = Math.max(
        this.bandRadius - this.radiusStep,
        this.minRadius
      );
      return true;
    }
    return false;
  }

  getCurrentRadius(): number {
    return this.bandRadius;
  }
}

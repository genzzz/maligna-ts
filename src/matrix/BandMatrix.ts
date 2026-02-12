import { Matrix, MatrixFactory, MatrixIterator } from './Matrix';

/**
 * Exception thrown when accessing a position outside the band.
 */
export class PositionOutsideBandException extends Error {
  constructor(x: number, y: number) {
    super(`Position (${x}, ${y}) is outside the band.`);
    this.name = 'PositionOutsideBandException';
  }
}

/**
 * Band matrix implementation that only stores elements within a diagonal band.
 * Uses less memory than FullMatrix when the band radius is small relative to dimensions.
 */
export class BandMatrix<T> implements Matrix<T> {
  private data: (T | null)[][];
  private width: number;
  private height: number;
  private bandRadius: number;
  private widthHeightRatio: number;
  private bandWidth: number;

  constructor(width: number, height: number, bandRadius: number) {
    this.width = width;
    this.height = height;
    this.bandRadius = bandRadius;

    if (height > 0) {
      this.widthHeightRatio = Math.fround(width / height);
    } else {
      this.widthHeightRatio = 1;
    }

    this.bandWidth = 2 * bandRadius + 1;

    this.data = new Array(this.bandWidth);
    for (let i = 0; i < this.bandWidth; i++) {
      this.data[i] = new Array(height).fill(null);
    }
  }

  get(x: number, y: number): T | null {
    const actualX = this.getActualX(x, y);
    if (actualX < 0 || actualX >= this.bandWidth) {
      return null;
    }
    return this.data[actualX][y];
  }

  set(x: number, y: number, data: T): void {
    const actualX = this.getActualX(x, y);
    if (actualX < 0 || actualX >= this.bandWidth) {
      throw new PositionOutsideBandException(x, y);
    }
    this.data[actualX][y] = data;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getSize(): number {
    return this.bandWidth * this.height;
  }

  getBandRadius(): number {
    return this.bandRadius;
  }

  getIterator(): MatrixIterator {
    return new BandMatrixIterator(
      this.width,
      this.height,
      this.bandRadius,
      this.widthHeightRatio
    );
  }

  /**
   * Returns the x position on the diagonal for a given y.
   * Uses truncation to match Java's (int) cast behavior.
   */
  getDiagonalX(y: number): number {
    return Math.trunc(Math.fround(y * this.widthHeightRatio));
  }

  /**
   * Converts matrix coordinates to band storage coordinates.
   */
  private getActualX(x: number, y: number): number {
    const diagonalX = this.getDiagonalX(y);
    return x - diagonalX + this.bandRadius;
  }
}

export class BandMatrixIterator implements MatrixIterator {
  private width: number;
  private height: number;
  private bandRadius: number;
  private widthHeightRatio: number;
  private x: number;
  private y: number;
  private cachedMinX: number;
  private cachedMaxX: number;

  constructor(
    width: number,
    height: number,
    bandRadius: number,
    widthHeightRatio: number
  ) {
    this.width = width;
    this.height = height;
    this.bandRadius = bandRadius;
    this.widthHeightRatio = widthHeightRatio;
    this.x = -1;
    this.y = 0;
    this.cachedMinX = 0;
    this.cachedMaxX = 0;
    this.calculateMinMaxX();
  }

  private calculateMinMaxX(): void {
    const diagonalX = Math.trunc(Math.fround(this.y * this.widthHeightRatio));
    this.cachedMinX = Math.max(0, diagonalX - this.bandRadius);
    this.cachedMaxX = Math.min(this.width - 1, diagonalX + this.bandRadius);
  }

  hasNext(): boolean {
    if (this.y >= this.height) return false;
    if (this.y < this.height - 1) return true;
    return this.x < this.cachedMaxX;
  }

  next(): [number, number] {
    this.x++;
    while (this.y < this.height) {
      if (this.x <= this.cachedMaxX) {
        return [this.x, this.y];
      }
      this.y++;
      if (this.y < this.height) {
        this.calculateMinMaxX();
        this.x = this.cachedMinX;
      }
    }
    return [this.x, this.y];
  }

  hasPrevious(): boolean {
    if (this.y < 0) return false;
    if (this.y > 0) return true;
    return this.x > this.cachedMinX;
  }

  previous(): [number, number] {
    this.x--;
    while (this.y >= 0) {
      if (this.x >= this.cachedMinX) {
        return [this.x, this.y];
      }
      this.y--;
      if (this.y >= 0) {
        this.calculateMinMaxX();
        this.x = this.cachedMaxX;
      }
    }
    return [this.x, this.y];
  }

  beforeFirst(): void {
    this.y = 0;
    this.calculateMinMaxX();
    this.x = this.cachedMinX - 1;
  }

  afterLast(): void {
    this.y = this.height - 1;
    this.calculateMinMaxX();
    this.x = this.cachedMaxX + 1;
  }
}

export class BandMatrixFactory<T> implements MatrixFactory<T> {
  public static readonly DEFAULT_BAND_RADIUS = 200;

  private bandRadius: number;

  constructor(bandRadius: number = BandMatrixFactory.DEFAULT_BAND_RADIUS) {
    this.bandRadius = bandRadius;
  }

  createMatrix(width: number, height: number): Matrix<T> {
    return new BandMatrix<T>(width, height, this.bandRadius);
  }

  getBandRadius(): number {
    return this.bandRadius;
  }
}

import { BandMatrix, BandMatrixFactory } from '../../src/matrix/BandMatrix';

describe('BandMatrix', () => {
  describe('constructor', () => {
    it('should create matrix with given dimensions and band radius', () => {
      const matrix = new BandMatrix<number>(10, 10, 3);
      expect(matrix.width).toBe(10);
      expect(matrix.height).toBe(10);
    });
  });

  describe('isInBand', () => {
    it('should return true for diagonal elements', () => {
      const matrix = new BandMatrix<number>(10, 10, 2);
      expect(matrix.isInBand(0, 0)).toBe(true);
      expect(matrix.isInBand(5, 5)).toBe(true);
      expect(matrix.isInBand(9, 9)).toBe(true);
    });

    it('should return true for elements within band radius', () => {
      const matrix = new BandMatrix<number>(10, 10, 2);
      // Near diagonal
      expect(matrix.isInBand(1, 0)).toBe(true);
      expect(matrix.isInBand(0, 1)).toBe(true);
      expect(matrix.isInBand(2, 0)).toBe(true);
    });

    it('should return false for elements outside band radius', () => {
      const matrix = new BandMatrix<number>(10, 10, 2);
      // Far from diagonal
      expect(matrix.isInBand(5, 0)).toBe(false);
      expect(matrix.isInBand(0, 5)).toBe(false);
    });

    it('should return false for out of bounds', () => {
      const matrix = new BandMatrix<number>(10, 10, 3);
      expect(matrix.isInBand(-1, 0)).toBe(false);
      expect(matrix.isInBand(0, -1)).toBe(false);
      expect(matrix.isInBand(10, 5)).toBe(false);
      expect(matrix.isInBand(5, 10)).toBe(false);
    });

    it('should handle non-square matrices', () => {
      const matrix = new BandMatrix<number>(20, 10, 3);
      expect(matrix.isInBand(0, 0)).toBe(true);
      // Slope is (20-1)/(10-1) ≈ 2.11
      // At y=5, diagonal x ≈ 10.5
      expect(matrix.isInBand(10, 5)).toBe(true);
      expect(matrix.isInBand(19, 9)).toBe(true);
    });
  });

  describe('get and set', () => {
    it('should set and get value within band', () => {
      const matrix = new BandMatrix<number>(10, 10, 3);
      matrix.set(5, 5, 42);
      expect(matrix.get(5, 5)).toBe(42);
    });

    it('should return undefined for unset cell in band', () => {
      const matrix = new BandMatrix<number>(10, 10, 3);
      expect(matrix.get(5, 5)).toBeUndefined();
    });

    it('should return undefined for cell outside band', () => {
      const matrix = new BandMatrix<number>(10, 10, 1);
      expect(matrix.get(5, 0)).toBeUndefined();
    });

    it('should not set value outside band', () => {
      const matrix = new BandMatrix<number>(10, 10, 1);
      matrix.set(5, 0, 42);
      expect(matrix.get(5, 0)).toBeUndefined();
    });

    it('should handle edge positions in band', () => {
      const matrix = new BandMatrix<number>(10, 10, 2);
      matrix.set(0, 0, 1);
      matrix.set(9, 9, 2);
      expect(matrix.get(0, 0)).toBe(1);
      expect(matrix.get(9, 9)).toBe(2);
    });
  });

  describe('size', () => {
    it('should return approximate band size', () => {
      const matrix = new BandMatrix<number>(10, 10, 2);
      // Band width is approximately 2*2+1 = 5, height is 10
      expect(matrix.size).toBe(50);
    });

    it('should be limited by actual width for large band', () => {
      const matrix = new BandMatrix<number>(5, 10, 100);
      // Band width can't exceed actual width
      expect(matrix.size).toBe(50);
    });
  });

  describe('getIterator', () => {
    it('should iterate only over band cells', () => {
      const matrix = new BandMatrix<number>(5, 5, 1);
      // Fill all band cells
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          if (matrix.isInBand(x, y)) {
            matrix.set(x, y, x * 10 + y);
          }
        }
      }

      const iterator = matrix.getIterator();
      const positions: [number, number][] = [];

      while (iterator.hasNext()) {
        iterator.next();
        positions.push([iterator.getX(), iterator.getY()]);
      }

      // Should only include positions within band
      for (const [x, y] of positions) {
        expect(matrix.isInBand(x, y)).toBe(true);
      }
    });

    it('should handle empty matrix', () => {
      const matrix = new BandMatrix<number>(0, 0, 1);
      const iterator = matrix.getIterator();
      expect(iterator.hasNext()).toBe(false);
    });

    it('should handle 1x1 matrix', () => {
      const matrix = new BandMatrix<number>(1, 1, 1);
      matrix.set(0, 0, 42);
      const iterator = matrix.getIterator();

      expect(iterator.hasNext()).toBe(true);
      const value = iterator.next();
      expect(value).toBe(42);
      expect(iterator.getX()).toBe(0);
      expect(iterator.getY()).toBe(0);
      expect(iterator.hasNext()).toBe(false);
    });
  });

  describe('with different types', () => {
    it('should work with strings', () => {
      const matrix = new BandMatrix<string>(5, 5, 2);
      matrix.set(2, 2, 'hello');
      expect(matrix.get(2, 2)).toBe('hello');
    });

    it('should work with objects', () => {
      interface Data {
        score: number;
        category: string;
      }
      const matrix = new BandMatrix<Data>(5, 5, 2);
      const obj: Data = { score: 1.5, category: '1-1' };
      matrix.set(2, 2, obj);
      expect(matrix.get(2, 2)).toBe(obj);
    });
  });
});

describe('BandMatrixFactory', () => {
  it('should create BandMatrix instances with default radius', () => {
    const factory = new BandMatrixFactory<number>();
    const matrix = factory.createMatrix(100, 100);
    expect(matrix.width).toBe(100);
    expect(matrix.height).toBe(100);
    expect(matrix).toBeInstanceOf(BandMatrix);
  });

  it('should create BandMatrix instances with custom radius', () => {
    const factory = new BandMatrixFactory<number>(10);
    const matrix = factory.createMatrix(100, 100);
    expect(matrix).toBeInstanceOf(BandMatrix);
    // Verify band radius by checking diagonal elements
    expect(matrix.get(0, 0)).toBeUndefined(); // unset but in band
    matrix.set(0, 0, 1);
    expect(matrix.get(0, 0)).toBe(1);
  });

  it('should create independent matrices', () => {
    const factory = new BandMatrixFactory<number>(5);
    const m1 = factory.createMatrix(10, 10);
    const m2 = factory.createMatrix(10, 10);
    m1.set(5, 5, 42);
    expect(m2.get(5, 5)).toBeUndefined();
  });
});

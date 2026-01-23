import { FullMatrix, FullMatrixFactory } from '../../src/matrix/FullMatrix';

describe('FullMatrix', () => {
  describe('constructor', () => {
    it('should create matrix with given dimensions', () => {
      const matrix = new FullMatrix<number>(5, 3);
      expect(matrix.width).toBe(5);
      expect(matrix.height).toBe(3);
    });

    it('should create empty matrix', () => {
      const matrix = new FullMatrix<number>(0, 0);
      expect(matrix.width).toBe(0);
      expect(matrix.height).toBe(0);
    });
  });

  describe('size', () => {
    it('should return width * height', () => {
      const matrix = new FullMatrix<number>(5, 3);
      expect(matrix.size).toBe(15);
    });

    it('should return 0 for empty matrix', () => {
      const matrix = new FullMatrix<number>(0, 0);
      expect(matrix.size).toBe(0);
    });

    it('should return 0 for matrix with one dimension 0', () => {
      const matrix = new FullMatrix<number>(5, 0);
      expect(matrix.size).toBe(0);
    });
  });

  describe('get and set', () => {
    it('should set and get value', () => {
      const matrix = new FullMatrix<number>(5, 5);
      matrix.set(2, 3, 42);
      expect(matrix.get(2, 3)).toBe(42);
    });

    it('should return undefined for unset cell', () => {
      const matrix = new FullMatrix<number>(5, 5);
      expect(matrix.get(2, 3)).toBeUndefined();
    });

    it('should return undefined for out of bounds (negative x)', () => {
      const matrix = new FullMatrix<number>(5, 5);
      expect(matrix.get(-1, 0)).toBeUndefined();
    });

    it('should return undefined for out of bounds (negative y)', () => {
      const matrix = new FullMatrix<number>(5, 5);
      expect(matrix.get(0, -1)).toBeUndefined();
    });

    it('should return undefined for out of bounds (x >= width)', () => {
      const matrix = new FullMatrix<number>(5, 5);
      expect(matrix.get(5, 0)).toBeUndefined();
    });

    it('should return undefined for out of bounds (y >= height)', () => {
      const matrix = new FullMatrix<number>(5, 5);
      expect(matrix.get(0, 5)).toBeUndefined();
    });

    it('should not set value for out of bounds', () => {
      const matrix = new FullMatrix<number>(5, 5);
      matrix.set(-1, 0, 42);
      matrix.set(0, -1, 42);
      matrix.set(5, 0, 42);
      matrix.set(0, 5, 42);
      // No exception should be thrown, just ignored
      expect(matrix.get(0, 0)).toBeUndefined();
    });

    it('should handle corner positions', () => {
      const matrix = new FullMatrix<number>(5, 5);
      matrix.set(0, 0, 1);
      matrix.set(4, 0, 2);
      matrix.set(0, 4, 3);
      matrix.set(4, 4, 4);
      expect(matrix.get(0, 0)).toBe(1);
      expect(matrix.get(4, 0)).toBe(2);
      expect(matrix.get(0, 4)).toBe(3);
      expect(matrix.get(4, 4)).toBe(4);
    });

    it('should overwrite existing values', () => {
      const matrix = new FullMatrix<number>(5, 5);
      matrix.set(2, 2, 10);
      expect(matrix.get(2, 2)).toBe(10);
      matrix.set(2, 2, 20);
      expect(matrix.get(2, 2)).toBe(20);
    });
  });

  describe('getIterator', () => {
    it('should iterate over all cells', () => {
      const matrix = new FullMatrix<number>(2, 2);
      matrix.set(0, 0, 1);
      matrix.set(1, 0, 2);
      matrix.set(0, 1, 3);
      matrix.set(1, 1, 4);

      const iterator = matrix.getIterator();
      const values: (number | undefined)[] = [];
      const positions: [number, number][] = [];

      while (iterator.hasNext()) {
        const value = iterator.next();
        values.push(value);
        positions.push([iterator.getX(), iterator.getY()]);
      }

      expect(values).toEqual([1, 2, 3, 4]);
      expect(positions).toEqual([
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]);
    });

    it('should handle empty matrix', () => {
      const matrix = new FullMatrix<number>(0, 0);
      const iterator = matrix.getIterator();
      expect(iterator.hasNext()).toBe(false);
    });

    it('should handle 1x1 matrix', () => {
      const matrix = new FullMatrix<number>(1, 1);
      matrix.set(0, 0, 42);
      const iterator = matrix.getIterator();

      expect(iterator.hasNext()).toBe(true);
      expect(iterator.next()).toBe(42);
      expect(iterator.getX()).toBe(0);
      expect(iterator.getY()).toBe(0);
      expect(iterator.hasNext()).toBe(false);
    });

    it('should iterate row by row', () => {
      const matrix = new FullMatrix<number>(3, 2);
      const iterator = matrix.getIterator();
      const positions: [number, number][] = [];

      while (iterator.hasNext()) {
        iterator.next();
        positions.push([iterator.getX(), iterator.getY()]);
      }

      // Should iterate (0,0), (1,0), (2,0), (0,1), (1,1), (2,1)
      expect(positions).toEqual([
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ]);
    });
  });

  describe('with different types', () => {
    it('should work with strings', () => {
      const matrix = new FullMatrix<string>(2, 2);
      matrix.set(0, 0, 'hello');
      matrix.set(1, 1, 'world');
      expect(matrix.get(0, 0)).toBe('hello');
      expect(matrix.get(1, 1)).toBe('world');
    });

    it('should work with objects', () => {
      interface Data {
        value: number;
      }
      const matrix = new FullMatrix<Data>(2, 2);
      const obj = { value: 42 };
      matrix.set(0, 0, obj);
      expect(matrix.get(0, 0)).toBe(obj);
      expect(matrix.get(0, 0)?.value).toBe(42);
    });
  });
});

describe('FullMatrixFactory', () => {
  it('should create FullMatrix instances', () => {
    const factory = new FullMatrixFactory<number>();
    const matrix = factory.createMatrix(5, 3);
    expect(matrix.width).toBe(5);
    expect(matrix.height).toBe(3);
    expect(matrix).toBeInstanceOf(FullMatrix);
  });

  it('should create independent matrices', () => {
    const factory = new FullMatrixFactory<number>();
    const m1 = factory.createMatrix(3, 3);
    const m2 = factory.createMatrix(3, 3);
    m1.set(0, 0, 1);
    expect(m2.get(0, 0)).toBeUndefined();
  });
});

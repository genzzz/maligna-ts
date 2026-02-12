import { describe, test, expect } from 'vitest';
import { BandMatrix, BandMatrixIterator, BandMatrixFactory, PositionOutsideBandException } from '../../src/matrix/BandMatrix';

describe('BandMatrixTest', () => {
  test('getSetWithinBand', () => {
    const matrix = new BandMatrix<number>(10, 10, 2);
    // Set values on the diagonal
    matrix.set(0, 0, 42);
    matrix.set(5, 5, 99);
    matrix.set(9, 9, 7);
    expect(matrix.get(0, 0)).toBe(42);
    expect(matrix.get(5, 5)).toBe(99);
    expect(matrix.get(9, 9)).toBe(7);
  });

  test('getSetOffDiagonalWithinBand', () => {
    const matrix = new BandMatrix<string>(10, 10, 3);
    // Within band radius of 3 from diagonal
    matrix.set(0, 0, 'a');
    matrix.set(1, 0, 'b');
    matrix.set(2, 0, 'c');
    matrix.set(3, 0, 'd');
    expect(matrix.get(0, 0)).toBe('a');
    expect(matrix.get(1, 0)).toBe('b');
    expect(matrix.get(2, 0)).toBe('c');
    expect(matrix.get(3, 0)).toBe('d');
  });

  test('getOutsideBandReturnsNull', () => {
    const matrix = new BandMatrix<number>(10, 10, 1);
    // Position far from diagonal should return null
    expect(matrix.get(9, 0)).toBeNull();
    expect(matrix.get(0, 9)).toBeNull();
  });

  test('setOutsideBandThrows', () => {
    const matrix = new BandMatrix<number>(10, 10, 1);
    // Setting far from diagonal should throw
    expect(() => matrix.set(9, 0, 42)).toThrow(PositionOutsideBandException);
    expect(() => matrix.set(0, 9, 42)).toThrow(PositionOutsideBandException);
  });

  test('getDimensions', () => {
    const matrix = new BandMatrix<number>(5, 8, 2);
    expect(matrix.getWidth()).toBe(5);
    expect(matrix.getHeight()).toBe(8);
    expect(matrix.getBandRadius()).toBe(2);
    expect(matrix.getSize()).toBe(5 * 8); // bandWidth * height = (2*2+1)*8 = 40
  });

  test('getDiagonalX', () => {
    // Square matrix — diagonal is x=y
    const square = new BandMatrix<number>(10, 10, 2);
    expect(square.getDiagonalX(0)).toBe(0);
    expect(square.getDiagonalX(5)).toBe(5);
    expect(square.getDiagonalX(9)).toBe(9);

    // Non-square matrix — diagonal is scaled
    const rect = new BandMatrix<number>(20, 10, 2);
    expect(rect.getDiagonalX(0)).toBe(0);
    expect(rect.getDiagonalX(5)).toBe(10);
    expect(rect.getDiagonalX(10)).toBe(20);
  });

  test('getUninitializedReturnsNull', () => {
    const matrix = new BandMatrix<number>(5, 5, 2);
    // Unset position within band should be null
    expect(matrix.get(0, 0)).toBeNull();
    expect(matrix.get(1, 1)).toBeNull();
  });
});

describe('BandMatrixIteratorTest', () => {
  test('iterateForwardSmallMatrix', () => {
    const matrix = new BandMatrix<number>(3, 3, 1);
    const iterator = matrix.getIterator();
    iterator.beforeFirst();

    const positions: [number, number][] = [];
    while (iterator.hasNext()) {
      positions.push(iterator.next());
    }

    // With band radius 1, we should visit: (0,0),(1,0), (0,1),(1,1),(2,1), (1,2),(2,2)
    expect(positions.length).toBeGreaterThan(0);
    // All positions should be within bounds
    for (const [x, y] of positions) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(3);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(3);
    }
  });

  test('iterateBackwardSmallMatrix', () => {
    const matrix = new BandMatrix<number>(3, 3, 1);
    const iterator = matrix.getIterator();
    iterator.afterLast();

    const positions: [number, number][] = [];
    while (iterator.hasPrevious()) {
      positions.push(iterator.previous());
    }

    expect(positions.length).toBeGreaterThan(0);
    // All positions should be within bounds
    for (const [x, y] of positions) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(3);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(3);
    }
  });

  test('forwardBackwardSamePositions', () => {
    const matrix = new BandMatrix<number>(4, 4, 1);
    const iter1 = matrix.getIterator();
    iter1.beforeFirst();
    const forward: [number, number][] = [];
    while (iter1.hasNext()) {
      forward.push(iter1.next());
    }

    const iter2 = matrix.getIterator();
    iter2.afterLast();
    const backward: [number, number][] = [];
    while (iter2.hasPrevious()) {
      backward.push(iter2.previous());
    }

    // Forward and reversed backward should visit same positions
    backward.reverse();
    expect(backward).toEqual(forward);
  });

  test('iterateEmptyMatrix', () => {
    const matrix = new BandMatrix<number>(0, 0, 1);
    const iterator = matrix.getIterator();
    iterator.beforeFirst();
    expect(iterator.hasNext()).toBe(false);
  });

  test('setAndRetrieveViaIterator', () => {
    const matrix = new BandMatrix<number>(5, 5, 2);
    const iterator = matrix.getIterator();
    iterator.beforeFirst();

    let count = 0;
    while (iterator.hasNext()) {
      const [x, y] = iterator.next();
      matrix.set(x, y, count);
      count++;
    }

    // Verify all values were stored
    const iter2 = matrix.getIterator();
    iter2.beforeFirst();
    let verify = 0;
    while (iter2.hasNext()) {
      const [x, y] = iter2.next();
      expect(matrix.get(x, y)).toBe(verify);
      verify++;
    }
    expect(verify).toBe(count);
  });
});

describe('BandMatrixFactoryTest', () => {
  test('createMatrixWithDefaultRadius', () => {
    const factory = new BandMatrixFactory<number>();
    const matrix = factory.createMatrix(10, 10);
    expect(matrix.getWidth()).toBe(10);
    expect(matrix.getHeight()).toBe(10);
    expect(factory.getBandRadius()).toBe(BandMatrixFactory.DEFAULT_BAND_RADIUS);
  });

  test('createMatrixWithCustomRadius', () => {
    const factory = new BandMatrixFactory<number>(5);
    const matrix = factory.createMatrix(20, 15);
    expect(matrix.getWidth()).toBe(20);
    expect(matrix.getHeight()).toBe(15);
    expect(factory.getBandRadius()).toBe(5);
  });

  test('defaultBandRadiusIs200', () => {
    expect(BandMatrixFactory.DEFAULT_BAND_RADIUS).toBe(200);
  });
});

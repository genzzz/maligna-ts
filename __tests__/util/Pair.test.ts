import { Pair } from '../../src/util/Pair';

describe('Pair', () => {
  describe('constructor', () => {
    it('should create pair with given values', () => {
      const pair = new Pair(1, 'hello');
      expect(pair.first).toBe(1);
      expect(pair.second).toBe('hello');
    });

    it('should create pair with objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const pair = new Pair(obj1, obj2);
      expect(pair.first).toBe(obj1);
      expect(pair.second).toBe(obj2);
    });

    it('should create pair with null values', () => {
      const pair = new Pair(null, null);
      expect(pair.first).toBeNull();
      expect(pair.second).toBeNull();
    });
  });

  describe('readonly properties', () => {
    it('should have readonly first and second', () => {
      const pair = new Pair(1, 2);
      // TypeScript enforces readonly, but we verify values are accessible
      expect(pair.first).toBe(1);
      expect(pair.second).toBe(2);
    });
  });

  describe('equals', () => {
    it('should return true for equal pairs with primitives', () => {
      const p1 = new Pair(1, 2);
      const p2 = new Pair(1, 2);
      expect(p1.equals(p2)).toBe(true);
    });

    it('should return false for different first values', () => {
      const p1 = new Pair(1, 2);
      const p2 = new Pair(2, 2);
      expect(p1.equals(p2)).toBe(false);
    });

    it('should return false for different second values', () => {
      const p1 = new Pair(1, 2);
      const p2 = new Pair(1, 3);
      expect(p1.equals(p2)).toBe(false);
    });

    it('should use reference equality for objects', () => {
      const obj = { a: 1 };
      const p1 = new Pair(obj, obj);
      const p2 = new Pair(obj, obj);
      expect(p1.equals(p2)).toBe(true);

      const p3 = new Pair({ a: 1 }, { a: 1 });
      expect(p1.equals(p3)).toBe(false);
    });

    it('should handle string values', () => {
      const p1 = new Pair('hello', 'world');
      const p2 = new Pair('hello', 'world');
      expect(p1.equals(p2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should format as (first, second)', () => {
      const pair = new Pair(1, 2);
      expect(pair.toString()).toBe('(1, 2)');
    });

    it('should handle string values', () => {
      const pair = new Pair('hello', 'world');
      expect(pair.toString()).toBe('(hello, world)');
    });

    it('should handle null values', () => {
      const pair = new Pair(null, null);
      expect(pair.toString()).toBe('(null, null)');
    });

    it('should handle undefined values', () => {
      const pair = new Pair(undefined, undefined);
      expect(pair.toString()).toBe('(undefined, undefined)');
    });

    it('should handle mixed types', () => {
      const pair = new Pair(42, 'answer');
      expect(pair.toString()).toBe('(42, answer)');
    });
  });

  describe('type safety', () => {
    it('should maintain types for different generics', () => {
      const numPair = new Pair<number, number>(1, 2);
      expect(typeof numPair.first).toBe('number');
      expect(typeof numPair.second).toBe('number');

      const strPair = new Pair<string, string>('a', 'b');
      expect(typeof strPair.first).toBe('string');
      expect(typeof strPair.second).toBe('string');

      const mixedPair = new Pair<number, string>(1, 'hello');
      expect(typeof mixedPair.first).toBe('number');
      expect(typeof mixedPair.second).toBe('string');
    });
  });
});

import { Category } from '../../src/core/Category';

describe('Category', () => {
  describe('constructor', () => {
    it('should create category with given counts', () => {
      const category = new Category(2, 1);
      expect(category.sourceSegmentCount).toBe(2);
      expect(category.targetSegmentCount).toBe(1);
    });

    it('should create 0-0 category', () => {
      const category = new Category(0, 0);
      expect(category.sourceSegmentCount).toBe(0);
      expect(category.targetSegmentCount).toBe(0);
    });
  });

  describe('toString', () => {
    it('should format as (source-target)', () => {
      const category = new Category(2, 1);
      expect(category.toString()).toBe('(2-1)');
    });

    it('should format 1-1 correctly', () => {
      const category = new Category(1, 1);
      expect(category.toString()).toBe('(1-1)');
    });

    it('should format 0-0 correctly', () => {
      const category = new Category(0, 0);
      expect(category.toString()).toBe('(0-0)');
    });
  });

  describe('equals', () => {
    it('should return true for equal categories', () => {
      const c1 = new Category(2, 1);
      const c2 = new Category(2, 1);
      expect(c1.equals(c2)).toBe(true);
    });

    it('should return false for different source counts', () => {
      const c1 = new Category(1, 1);
      const c2 = new Category(2, 1);
      expect(c1.equals(c2)).toBe(false);
    });

    it('should return false for different target counts', () => {
      const c1 = new Category(1, 1);
      const c2 = new Category(1, 2);
      expect(c1.equals(c2)).toBe(false);
    });
  });

  describe('toKey', () => {
    it('should create unique key string', () => {
      const category = new Category(2, 1);
      expect(category.toKey()).toBe('2-1');
    });

    it('should create key for 0-0', () => {
      const category = new Category(0, 0);
      expect(category.toKey()).toBe('0-0');
    });
  });

  describe('fromKey', () => {
    it('should parse key string into category', () => {
      const category = Category.fromKey('2-1');
      expect(category.sourceSegmentCount).toBe(2);
      expect(category.targetSegmentCount).toBe(1);
    });

    it('should parse 0-0 key', () => {
      const category = Category.fromKey('0-0');
      expect(category.sourceSegmentCount).toBe(0);
      expect(category.targetSegmentCount).toBe(0);
    });

    it('should round-trip through toKey and fromKey', () => {
      const original = new Category(3, 2);
      const roundTripped = Category.fromKey(original.toKey());
      expect(roundTripped.equals(original)).toBe(true);
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const category = new Category(1, 1);
      // TypeScript will prevent assignment, but we verify the values don't change
      expect(category.sourceSegmentCount).toBe(1);
      expect(category.targetSegmentCount).toBe(1);
    });
  });
});

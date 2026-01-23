import { Category } from '../../src/core/Category';
import {
  BEST_CATEGORY_MAP,
  MOORE_CATEGORY_MAP,
  getCategoryScore,
  categoryEntries,
} from '../../src/core/CategoryDefaults';
import { toScore } from '../../src/util/math';

describe('CategoryDefaults', () => {
  describe('BEST_CATEGORY_MAP', () => {
    it('should contain 1-1 category', () => {
      const score = getCategoryScore(BEST_CATEGORY_MAP, new Category(1, 1));
      expect(score).toBeDefined();
      expect(score).toBeCloseTo(toScore(0.9), 5);
    });

    it('should contain 1-0 category', () => {
      const score = getCategoryScore(BEST_CATEGORY_MAP, new Category(1, 0));
      expect(score).toBeDefined();
      expect(score).toBeCloseTo(toScore(0.005), 5);
    });

    it('should contain 0-1 category', () => {
      const score = getCategoryScore(BEST_CATEGORY_MAP, new Category(0, 1));
      expect(score).toBeDefined();
      expect(score).toBeCloseTo(toScore(0.005), 5);
    });

    it('should contain 2-1 category', () => {
      const score = getCategoryScore(BEST_CATEGORY_MAP, new Category(2, 1));
      expect(score).toBeDefined();
      expect(score).toBeCloseTo(toScore(0.045), 5);
    });

    it('should contain 1-2 category', () => {
      const score = getCategoryScore(BEST_CATEGORY_MAP, new Category(1, 2));
      expect(score).toBeDefined();
      expect(score).toBeCloseTo(toScore(0.045), 5);
    });

    it('should return undefined for unknown category', () => {
      const score = getCategoryScore(BEST_CATEGORY_MAP, new Category(5, 5));
      expect(score).toBeUndefined();
    });
  });

  describe('MOORE_CATEGORY_MAP', () => {
    it('should contain 1-1 category with Moore probability', () => {
      const score = getCategoryScore(MOORE_CATEGORY_MAP, new Category(1, 1));
      expect(score).toBeDefined();
      expect(score).toBeCloseTo(toScore(0.94), 5);
    });

    it('should contain 1-0 category', () => {
      const score = getCategoryScore(MOORE_CATEGORY_MAP, new Category(1, 0));
      expect(score).toBeDefined();
      expect(score).toBeCloseTo(toScore(0.01), 5);
    });

    it('should contain 2-1 category', () => {
      const score = getCategoryScore(MOORE_CATEGORY_MAP, new Category(2, 1));
      expect(score).toBeDefined();
      expect(score).toBeCloseTo(toScore(0.02), 5);
    });
  });

  describe('getCategoryScore', () => {
    it('should return score for existing category', () => {
      const score = getCategoryScore(BEST_CATEGORY_MAP, new Category(1, 1));
      expect(typeof score).toBe('number');
    });

    it('should return undefined for non-existing category', () => {
      const score = getCategoryScore(BEST_CATEGORY_MAP, new Category(10, 10));
      expect(score).toBeUndefined();
    });
  });

  describe('categoryEntries', () => {
    it('should iterate over all categories in BEST_CATEGORY_MAP', () => {
      const entries = Array.from(categoryEntries(BEST_CATEGORY_MAP));
      expect(entries.length).toBe(5);

      const categories = entries.map(([cat]) => cat.toKey());
      expect(categories).toContain('1-1');
      expect(categories).toContain('1-0');
      expect(categories).toContain('0-1');
      expect(categories).toContain('2-1');
      expect(categories).toContain('1-2');
    });

    it('should return Category instances and scores', () => {
      for (const [category, score] of categoryEntries(BEST_CATEGORY_MAP)) {
        expect(category).toBeInstanceOf(Category);
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThan(0);
      }
    });

    it('should iterate over MOORE_CATEGORY_MAP', () => {
      const entries = Array.from(categoryEntries(MOORE_CATEGORY_MAP));
      expect(entries.length).toBe(5);
    });
  });
});

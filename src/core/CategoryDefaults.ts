import { Category } from './Category.js';
import { toScore } from '../util/math.js';

/**
 * Default categories with scores (-ln probability) of occurrence of alignment
 * of this category measured experimentally in some test corpus.
 */
export const BEST_CATEGORY_MAP: Map<string, number> = new Map([
  [new Category(1, 1).toKey(), toScore(0.9)],
  [new Category(1, 0).toKey(), toScore(0.005)],
  [new Category(0, 1).toKey(), toScore(0.005)],
  [new Category(2, 1).toKey(), toScore(0.045)],
  [new Category(1, 2).toKey(), toScore(0.045)],
]);

/**
 * Moore's algorithm categories with their scores.
 */
export const MOORE_CATEGORY_MAP: Map<string, number> = new Map([
  [new Category(1, 1).toKey(), toScore(0.94)],
  [new Category(1, 0).toKey(), toScore(0.01)],
  [new Category(0, 1).toKey(), toScore(0.01)],
  [new Category(2, 1).toKey(), toScore(0.02)],
  [new Category(1, 2).toKey(), toScore(0.02)],
]);

/**
 * Get score for a category from a category map.
 */
export function getCategoryScore(
  categoryMap: Map<string, number>,
  category: Category
): number | undefined {
  return categoryMap.get(category.toKey());
}

/**
 * Iterate over category entries from a map.
 */
export function* categoryEntries(
  categoryMap: Map<string, number>
): Generator<[Category, number]> {
  for (const [key, score] of categoryMap) {
    yield [Category.fromKey(key), score];
  }
}

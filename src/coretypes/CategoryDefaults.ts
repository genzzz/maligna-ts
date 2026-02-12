import { toScore } from '../util/util';
import { Category } from './Category';

/**
 * A pre-computed category entry: category object + its score.
 * Avoids per-cell string parsing and Map lookups.
 */
export interface CategoryEntry {
  readonly category: Category;
  readonly score: number;
}

/**
 * Default category probability maps used for alignment algorithms.
 * Keys are category keys like "1-1", "0-1", etc.
 * Values are scores (-ln(probability)).
 */

function buildCategoryMap(entries: [string, number][]): Map<string, number> {
  const map = new Map<string, number>();
  for (const [key, probability] of entries) {
    // Java: (float)Util.toScore(prob) — truncate to 32-bit float
    map.set(key, Math.fround(toScore(probability)));
  }
  return map;
}

/**
 * Builds a cached array of CategoryEntry from a category map.
 * Call once and reuse — avoids per-cell string parsing.
 */
export function buildCategoryEntries(categoryMap: Map<string, number>): CategoryEntry[] {
  const entries: CategoryEntry[] = [];
  for (const [key, score] of categoryMap.entries()) {
    const parts = key.split('-');
    entries.push({
      category: new Category(parseInt(parts[0]), parseInt(parts[1])),
      score,
    });
  }
  return entries;
}

/**
 * Best category map used by most algorithms.
 * Based on empirical observations.
 */
export const BEST_CATEGORY_MAP: Map<string, number> = buildCategoryMap([
  ['1-1', 0.9],
  ['1-0', 0.005],
  ['0-1', 0.005],
  ['2-1', 0.045],
  ['1-2', 0.045],
]);

/**
 * Moore category map used in Moore's algorithm.
 */
export const MOORE_CATEGORY_MAP: Map<string, number> = buildCategoryMap([
  ['1-1', 0.94],
  ['1-0', 0.01],
  ['0-1', 0.01],
  ['2-1', 0.02],
  ['1-2', 0.02],
]);

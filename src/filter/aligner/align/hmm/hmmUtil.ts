import { Category } from '../../../../coretypes/Category';
import { CategoryEntry, buildCategoryEntries } from '../../../../coretypes/CategoryDefaults';

/**
 * Returns a cached array of CategoryEntry for HMM alignment.
 * Parses the string keys once and caches the result.
 */
const categoryEntriesCache = new WeakMap<Map<string, number>, CategoryEntry[]>();

export function getCategoryEntries(categoryMap: Map<string, number>): CategoryEntry[] {
  let entries = categoryEntriesCache.get(categoryMap);
  if (!entries) {
    entries = buildCategoryEntries(categoryMap);
    categoryEntriesCache.set(categoryMap, entries);
  }
  return entries;
}

/**
 * Returns the default list of categories for HMM alignment.
 * Derived from the category map keys.
 * @deprecated Use getCategoryEntries() for better performance.
 */
export function getCategoryList(categoryMap: Map<string, number>): Category[] {
  return getCategoryEntries(categoryMap).map(e => e.category);
}

/**
 * Gets the score for a category from the category map.
 * @deprecated Use getCategoryEntries() for better performance.
 */
export function getCategoryScore(
  categoryMap: Map<string, number>,
  category: Category
): number {
  const score = categoryMap.get(category.toKey());
  if (score === undefined) {
    return Infinity;
  }
  return score;
}

import { Category } from './Category.js';
import { toScore } from '../util/Util.js';

/**
 * Responsible for storing default categories with scores (-ln probability)
 * of occurrence of alignment of this category measured experimentally in some
 * test corpus.
 */

export type CategoryMap = Map<string, { category: Category; score: number }>;

/**
 * Creates best category map with empirically determined probabilities.
 */
function createBestCategoryMap(): CategoryMap {
  const map: CategoryMap = new Map();

  const categories = [
    { src: 1, tgt: 1, prob: 0.9 },
    { src: 1, tgt: 0, prob: 0.005 },
    { src: 0, tgt: 1, prob: 0.005 },
    { src: 2, tgt: 1, prob: 0.045 },
    { src: 1, tgt: 2, prob: 0.045 },
  ];

  for (const { src, tgt, prob } of categories) {
    const category = new Category(src, tgt);
    map.set(category.toKey(), { category, score: toScore(prob) });
  }

  return map;
}

/**
 * Creates Moore category map with probabilities from Moore's paper.
 */
function createMooreCategoryMap(): CategoryMap {
  const map: CategoryMap = new Map();

  const categories = [
    { src: 1, tgt: 1, prob: 0.94 },
    { src: 1, tgt: 0, prob: 0.01 },
    { src: 0, tgt: 1, prob: 0.01 },
    { src: 2, tgt: 1, prob: 0.02 },
    { src: 1, tgt: 2, prob: 0.02 },
  ];

  for (const { src, tgt, prob } of categories) {
    const category = new Category(src, tgt);
    map.set(category.toKey(), { category, score: toScore(prob) });
  }

  return map;
}

export const BEST_CATEGORY_MAP: CategoryMap = createBestCategoryMap();
export const MOORE_CATEGORY_MAP: CategoryMap = createMooreCategoryMap();

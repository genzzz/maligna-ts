import { Counter } from './Counter.js';
import { SplitAlgorithm } from '../../../filter/modifier/modify/split/SplitAlgorithm.js';
import { WordSplitAlgorithm } from '../../../filter/modifier/modify/split/WordSplitAlgorithm.js';
import { FilterNonWordsSplitAlgorithmDecorator } from '../../../filter/modifier/modify/split/FilterNonWordsSplitAlgorithmDecorator.js';

/**
 * Default tokenize algorithm - splits into words and filters non-words.
 */
const DEFAULT_SPLIT_ALGORITHM: SplitAlgorithm =
  new FilterNonWordsSplitAlgorithmDecorator(new WordSplitAlgorithm());

/**
 * Responsible for calculating length of segment in words. Uses given word
 * splitting algorithm or default split algorithm.
 */
export class SplitCounter implements Counter {
  private readonly splitAlgorithm: SplitAlgorithm;

  /**
   * Create calculator using given word split algorithm.
   */
  constructor(splitAlgorithm?: SplitAlgorithm) {
    this.splitAlgorithm = splitAlgorithm ?? DEFAULT_SPLIT_ALGORITHM;
  }

  /**
   * Calculates length of a segment in words.
   */
  calculateLength(segment: string): number {
    return this.splitAlgorithm.split(segment).length;
  }
}

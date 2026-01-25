import { Category } from '../../../../../coretypes/Category.js';

/**
 * Represents alignment data type stored in a matrix by ViterbiAlgorithm.
 * Includes current alignment category, its score and cumulative score of
 * all alignments scores from best path leading to this alignment including
 * its score.
 */
export class ViterbiData {
  private readonly _category: Category;
  private readonly _score: number;
  private readonly _totalScore: number;

  /**
   * Creates data.
   * @param category category of an alignment
   * @param score score of this alignment
   * @param totalScore total score of this alignment including all previous
   *    alignments on the path
   */
  constructor(category: Category, score: number, totalScore: number) {
    this._category = category;
    this._score = score;
    this._totalScore = totalScore;
  }

  /**
   * @returns this alignment score
   */
  get score(): number {
    return this._score;
  }

  /**
   * @returns total score of this alignment including all previous alignments
   *    on the path
   */
  get totalScore(): number {
    return this._totalScore;
  }

  /**
   * @returns this alignment category
   */
  get category(): Category {
    return this._category;
  }
}

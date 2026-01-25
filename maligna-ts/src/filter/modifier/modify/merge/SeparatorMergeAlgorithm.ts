import { MergeAlgorithm } from './MergeAlgorithm.js';

/**
 * Represents an algorithm merging a list of segments into one segment by
 * concatenating them. It can insert given separator string between segments.
 */
export class SeparatorMergeAlgorithm extends MergeAlgorithm {
  static readonly DEFAULT_SEPARATOR = '';

  private separator: string;

  /**
   * Creates merge algorithm.
   * @param separator separator
   */
  constructor(separator: string = SeparatorMergeAlgorithm.DEFAULT_SEPARATOR) {
    super();
    this.separator = separator;
  }

  /**
   * Merges list of segments into one segment by concatenating them and
   * inserting separator between.
   * @param segmentList input segment list
   * @returns merged segment
   */
  merge(segmentList: string[]): string {
    return segmentList.join(this.separator);
  }
}

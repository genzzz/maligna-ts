import { SplitAlgorithm } from './SplitAlgorithm.js';

/**
 * Checks if a character is a letter or digit (alphanumeric).
 */
function isLetterOrDigit(ch: string): boolean {
  return /^[\p{L}\p{N}]$/u.test(ch);
}

/**
 * Represents a split algorithm that splits input segment using
 * given algorithm but ignores all punctuation in the output segments.
 * To be used together with WordSplitAlgorithm.
 * Decorator design pattern.
 */
export class FilterNonWordsSplitAlgorithmDecorator extends SplitAlgorithm {
  private readonly splitAlgorithm: SplitAlgorithm;

  /**
   * Creates splitter decorator.
   * @param splitAlgorithm split algorithm to be used
   */
  constructor(splitAlgorithm: SplitAlgorithm) {
    super();
    this.splitAlgorithm = splitAlgorithm;
  }

  split(str: string): string[] {
    const segmentList = this.splitAlgorithm.split(str);
    const resultSegmentList: string[] = [];

    for (const segment of segmentList) {
      // Checks whether segment consists only of letters and numbers.
      // Assumes that if the first character is a letter or number
      // then that's true.
      if (segment.length > 0 && isLetterOrDigit(segment.charAt(0))) {
        resultSegmentList.push(segment.toLowerCase());
      }
    }

    return resultSegmentList;
  }
}

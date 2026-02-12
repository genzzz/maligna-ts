import { SplitAlgorithm } from './SplitAlgorithm';

/**
 * Splits text into words on non-letter/digit boundaries.
 * Non-whitespace, non-letter/digit characters are emitted as separate tokens.
 * Whitespace is consumed silently.
 * Matches Java's WordSplitAlgorithm exactly.
 */
export class WordSplitAlgorithm extends SplitAlgorithm {
  // Regex matching a single Unicode letter or digit
  private static readonly LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;
  private static readonly WHITESPACE = /\s/;

  split(segment: string): string[] {
    const result: string[] = [];
    let start = 0;

    for (let end = 0; end < segment.length; end++) {
      const ch = segment[end];
      if (!WordSplitAlgorithm.LETTER_OR_DIGIT.test(ch)) {
        // End current word if any
        if (end - start > 0) {
          result.push(segment.substring(start, end));
        }
        // Non-whitespace non-letter/digit chars become their own token
        if (!WordSplitAlgorithm.WHITESPACE.test(ch)) {
          result.push(segment.substring(end, end + 1));
        }
        start = end + 1;
      }
    }

    // Remaining word
    if (start < segment.length) {
      result.push(segment.substring(start));
    }
    return result;
  }
}

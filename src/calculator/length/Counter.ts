/**
 * Counter interface for measuring segment length.
 * Matches Java's Counter which operates on individual segments.
 */
export interface Counter {
  /** Count length of a single segment. */
  countSingle(segment: string): number;
  /** Count total length across all segments in a list. */
  count(segmentList: string[]): number;
  /** Count total length across segments in a range [start, end). */
  countRange(segmentList: string[], start: number, end: number): number;
}

/**
 * Character counter — counts total characters.
 */
export class CharCounter implements Counter {
  countSingle(segment: string): number {
    return segment.length;
  }

  count(segmentList: string[]): number {
    let total = 0;
    for (let i = 0; i < segmentList.length; i++) {
      total += segmentList[i].length;
    }
    return total;
  }

  countRange(segmentList: string[], start: number, end: number): number {
    let total = 0;
    for (let i = start; i < end; i++) {
      total += segmentList[i].length;
    }
    return total;
  }
}

/**
 * Checks if a character code is a letter or digit, matching Java's
 * Character.isLetterOrDigit(). Covers ASCII letters/digits and
 * Unicode letter/digit categories.
 */
function isLetterOrDigit(c: number): boolean {
  // ASCII fast path
  if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
    return true;
  }
  // Non-ASCII: use regex test on the character
  if (c > 127) {
    const ch = String.fromCodePoint(c);
    // \p{L} matches Unicode letters, \p{N} matches Unicode digits
    return /[\p{L}\p{N}]/u.test(ch);
  }
  return false;
}

/**
 * Split counter — counts words matching Java's SplitCounter which uses
 * WordSplitAlgorithm + FilterNonWordsSplitAlgorithmDecorator.
 *
 * Java splits on non-letter-digit boundaries (not just whitespace),
 * keeps punctuation as separate tokens, then filters out tokens that
 * don't start with a letter or digit.
 */
export class SplitCounter implements Counter {
  countSingle(segment: string): number {
    // Replicate Java's WordSplitAlgorithm + FilterNonWordsSplitAlgorithmDecorator
    // but only counting, not allocating strings.
    let count = 0;
    let start = 0;
    for (let end = 0; end < segment.length; end++) {
      const ch = segment.charCodeAt(end);
      if (!isLetterOrDigit(ch)) {
        // End of a letter-digit run
        if (end - start > 0) {
          // This was a letter-digit token — it starts with letterOrDigit, so it passes the filter
          count++;
        }
        // Non-whitespace non-letterdigit chars become punctuation tokens
        // but they get filtered by FilterNonWordsSplitAlgorithmDecorator
        // since they don't start with a letter or digit. So we skip them.
        start = end + 1;
      }
    }
    // Remaining token at end of string
    if (start < segment.length) {
      count++;
    }
    return count;
  }

  count(segmentList: string[]): number {
    let total = 0;
    for (let i = 0; i < segmentList.length; i++) {
      total += this.countSingle(segmentList[i]);
    }
    return total;
  }

  countRange(segmentList: string[], start: number, end: number): number {
    let total = 0;
    for (let i = start; i < end; i++) {
      total += this.countSingle(segmentList[i]);
    }
    return total;
  }
}

/**
 * Represents a counter that calculates the length of a segment.
 */
export interface Counter {
  /**
   * Counts the "length" of a segment (can be character count, word count, etc.)
   */
  count(segment: string): number;
}

/**
 * Counts characters in a segment.
 */
export class CharCounter implements Counter {
  count(segment: string): number {
    return segment.length;
  }
}

/**
 * Counts words in a segment by splitting on whitespace.
 */
export class SplitCounter implements Counter {
  private readonly pattern: RegExp;

  constructor(pattern: RegExp = /\s+/) {
    this.pattern = pattern;
  }

  count(segment: string): number {
    const trimmed = segment.trim();
    if (trimmed.length === 0) {
      return 0;
    }
    return trimmed.split(this.pattern).length;
  }
}

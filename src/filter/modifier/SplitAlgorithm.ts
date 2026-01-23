import { ModifyAlgorithm } from './ModifyAlgorithm.js';

/**
 * Abstract base class for split algorithms.
 * Splits single segment into a list of segments.
 */
export abstract class SplitAlgorithm implements ModifyAlgorithm {
  modify(segmentList: readonly string[]): string[] {
    const newSegmentList: string[] = [];
    for (const segment of segmentList) {
      const currentSegmentList = this.split(segment);
      newSegmentList.push(...currentSegmentList);
    }
    return newSegmentList;
  }

  /**
   * Splits a segment into a list of segments.
   */
  abstract split(segment: string): string[];
}

/**
 * Simple sentence splitter using regex patterns.
 */
export class SentenceSplitAlgorithm extends SplitAlgorithm {
  // Pattern matches end of sentence followed by space and capital letter
  // or newline
  private readonly pattern = /([.!?])\s+(?=[A-Z])|(\n+)/g;

  split(segment: string): string[] {
    const segments: string[] = [];
    let lastIndex = 0;

    // Find sentence boundaries
    const matches = segment.matchAll(this.pattern);
    for (const match of matches) {
      if (match.index !== undefined) {
        const end = match.index + match[0].length;
        const part = segment.slice(lastIndex, end).trim();
        if (part.length > 0) {
          segments.push(part);
        }
        lastIndex = end;
      }
    }

    // Add remaining text
    if (lastIndex < segment.length) {
      const remaining = segment.slice(lastIndex).trim();
      if (remaining.length > 0) {
        segments.push(remaining);
      }
    }

    return segments.length > 0 ? segments : [segment];
  }
}

/**
 * Paragraph splitter - splits on double newlines.
 */
export class ParagraphSplitAlgorithm extends SplitAlgorithm {
  split(segment: string): string[] {
    const paragraphs = segment.split(/\n\s*\n/);
    return paragraphs
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }
}

/**
 * Word splitter - splits on whitespace.
 */
export class WordSplitAlgorithm extends SplitAlgorithm {
  split(segment: string): string[] {
    const trimmed = segment.trim();
    if (trimmed.length === 0) {
      return [];
    }
    return trimmed.split(/\s+/);
  }
}

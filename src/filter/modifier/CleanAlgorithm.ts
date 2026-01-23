import { ModifyAlgorithm } from './ModifyAlgorithm.js';

/**
 * Abstract base class for clean algorithms.
 * Modifies segment contents without changing the number of segments.
 */
export abstract class CleanAlgorithm implements ModifyAlgorithm {
  modify(segmentList: readonly string[]): string[] {
    return segmentList.map((segment) => this.clean(segment));
  }

  abstract clean(segment: string): string;
}

/**
 * Trims whitespace from segments.
 */
export class TrimCleanAlgorithm extends CleanAlgorithm {
  clean(segment: string): string {
    return segment.trim();
  }
}

/**
 * Normalizes whitespace in segments (collapses multiple spaces).
 */
export class NormalizeWhitespaceCleanAlgorithm extends CleanAlgorithm {
  clean(segment: string): string {
    return segment.replace(/\s+/g, ' ').trim();
  }
}

/**
 * Converts segments to lowercase.
 */
export class LowercaseCleanAlgorithm extends CleanAlgorithm {
  clean(segment: string): string {
    return segment.toLowerCase();
  }
}

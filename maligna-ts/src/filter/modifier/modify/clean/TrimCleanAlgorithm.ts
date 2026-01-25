import { CleanAlgorithm } from './CleanAlgorithm.js';

/**
 * Represents clean algorithm trimming all the segments (removing leading and
 * trailing whitespace).
 * It also omits segments that are empty after trimming.
 */
export class TrimCleanAlgorithm extends CleanAlgorithm {
  clean(segment: string): string | null {
    const newSegment = segment.trim();
    if (newSegment.length === 0) {
      return null;
    }
    return newSegment;
  }
}

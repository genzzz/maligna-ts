import { CleanAlgorithm } from './CleanAlgorithm.js';

/**
 * Represents clean algorithm changing input segment to lower case.
 */
export class LowercaseCleanAlgorithm extends CleanAlgorithm {
  clean(segment: string): string | null {
    return segment.toLowerCase();
  }
}

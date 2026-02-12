import { SplitAlgorithm } from './SplitAlgorithm';

/**
 * Splits text on newline characters.
 */
export class ParagraphSplitAlgorithm extends SplitAlgorithm {
  split(segment: string): string[] {
    return segment.split('\n').filter((s) => s.length > 0);
  }
}

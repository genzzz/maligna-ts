import { SplitAlgorithm } from './SplitAlgorithm';
import { SimpleSplitter } from './SimpleSplitter';

/**
 * Splits text into sentences using simple heuristics.
 */
export class SentenceSplitAlgorithm extends SplitAlgorithm {
  private splitter = new SimpleSplitter();

  split(segment: string): string[] {
    return this.splitter.split(segment);
  }
}

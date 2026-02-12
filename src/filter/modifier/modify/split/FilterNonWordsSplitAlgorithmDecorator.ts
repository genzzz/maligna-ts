import { ModifyAlgorithm } from '../ModifyAlgorithm';
import { SplitAlgorithm } from './SplitAlgorithm';

/**
 * Decorator that filters out non-word tokens and lowercases remaining.
 * A token is a "word" if it contains at least one letter or digit.
 */
export class FilterNonWordsSplitAlgorithmDecorator implements ModifyAlgorithm {
  private algorithm: SplitAlgorithm;

  constructor(algorithm: SplitAlgorithm) {
    this.algorithm = algorithm;
  }

  modify(segmentList: string[]): string[] {
    const split = this.algorithm.modify(segmentList);
    const result: string[] = [];
    for (const token of split) {
      if (this.isWord(token)) {
        result.push(token.toLowerCase());
      }
    }
    return result;
  }

  private isWord(token: string): boolean {
    return /[\p{L}\p{N}]/u.test(token);
  }
}

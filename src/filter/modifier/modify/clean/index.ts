import { ModifyAlgorithm } from '../ModifyAlgorithm';

/**
 * Trims whitespace from segments and removes empty segments.
 */
export class TrimCleanAlgorithm implements ModifyAlgorithm {
  modify(segmentList: string[]): string[] {
    const result: string[] = [];
    for (const segment of segmentList) {
      const trimmed = segment.trim();
      if (trimmed.length > 0) {
        result.push(trimmed);
      }
    }
    return result;
  }
}

/**
 * Lowercases all segments.
 */
export class LowercaseCleanAlgorithm implements ModifyAlgorithm {
  modify(segmentList: string[]): string[] {
    return segmentList.map((s) => s.toLowerCase());
  }
}

/**
 * Removes segments that don't contain any letters.
 */
export class FilterNonWordsCleanAlgorithm implements ModifyAlgorithm {
  modify(segmentList: string[]): string[] {
    return segmentList.filter((s) => /[\p{L}]/u.test(s));
  }
}

/**
 * Replaces words not in vocabulary with "{OTHER}".
 */
export class UnifyRareWordsCleanAlgorithm implements ModifyAlgorithm {
  private static readonly OTHER_WORD = '{OTHER}';
  private vocabulary: { containsWord(word: string): boolean };

  constructor(vocabulary: { containsWord(word: string): boolean }) {
    this.vocabulary = vocabulary;
  }

  modify(segmentList: string[]): string[] {
    return segmentList.map((segment) => {
      const words = segment.split(/\s+/);
      const replaced = words.map((word) => {
        if (word.length === 0) return word;
        return this.vocabulary.containsWord(word)
          ? word
          : UnifyRareWordsCleanAlgorithm.OTHER_WORD;
      });
      return replaced.join(' ');
    });
  }
}

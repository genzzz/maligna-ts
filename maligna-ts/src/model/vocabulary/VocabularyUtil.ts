import { Alignment } from '../../coretypes/Alignment.js';
import { Vocabulary } from './Vocabulary.js';
import { SplitAlgorithm } from '../../filter/modifier/modify/split/SplitAlgorithm.js';
import { WordSplitAlgorithm } from '../../filter/modifier/modify/split/WordSplitAlgorithm.js';
import { FilterNonWordsSplitAlgorithmDecorator } from '../../filter/modifier/modify/split/FilterNonWordsSplitAlgorithmDecorator.js';

/**
 * Default word tokenization algorithm.
 */
export const DEFAULT_TOKENIZE_ALGORITHM: SplitAlgorithm =
  new FilterNonWordsSplitAlgorithmDecorator(new WordSplitAlgorithm());

/**
 * Minimum word count for rare word filtering.
 */
const MIN_WORD_COUNT = 2;

/**
 * For each alignment on input alignment list tokenizes all the segments
 * into words, inserts the words into appropriate vocabulary
 * (source or target) and returns a list of lists of source and target
 * word ids grouped by alignment.
 */
export function tokenizeAndBuildVocabulary(
  splitAlgorithm: SplitAlgorithm,
  alignmentList: readonly Alignment[],
  sourceVocabulary: Vocabulary,
  targetVocabulary: Vocabulary,
  sourceWidList: number[][],
  targetWidList: number[][]
): void {
  for (const alignment of alignmentList) {
    sourceWidList.push(
      tokenizePutGet(splitAlgorithm, alignment.sourceSegmentList, sourceVocabulary)
    );
    targetWidList.push(
      tokenizePutGet(splitAlgorithm, alignment.targetSegmentList, targetVocabulary)
    );
  }
}

/**
 * Tokenizes given segment list into words, puts them into given
 * vocabulary and returns their identifiers.
 */
function tokenizePutGet(
  splitAlgorithm: SplitAlgorithm,
  segmentList: readonly string[],
  vocabulary: Vocabulary
): number[] {
  const wordList = splitAlgorithm.modify(segmentList);
  vocabulary.putWordList(wordList);
  const widList = vocabulary.getWidList(wordList);
  // Filter out nulls (should not happen since we just put the words)
  return widList.filter((wid): wid is number => wid !== null);
}

/**
 * Tokenizes given segment list into words and retrieves their identifiers
 * from given vocabulary.
 */
export function tokenize(
  splitAlgorithm: SplitAlgorithm,
  segmentList: readonly string[],
  vocabulary: Vocabulary
): (number | null)[] {
  const wordList = splitAlgorithm.modify([...segmentList]);
  return vocabulary.getWidList(wordList);
}

/**
 * Creates a truncated vocabulary containing only frequent words.
 */
export function createTruncatedVocabulary(
  widListList: number[][],
  vocabulary: Vocabulary
): Vocabulary {
  // Count word occurrences
  const wordCounts = new Map<number, number>();
  for (const widList of widListList) {
    for (const wid of widList) {
      wordCounts.set(wid, (wordCounts.get(wid) ?? 0) + 1);
    }
  }

  // Filter to only include frequent words
  const frequentWords: string[] = [];
  for (const [wid, count] of wordCounts) {
    if (count >= MIN_WORD_COUNT) {
      const word = vocabulary.getWord(wid);
      if (word !== null) {
        frequentWords.push(word);
      }
    }
  }

  return new Vocabulary(frequentWords);
}

/**
 * Utility class for vocabulary operations.
 */
export class VocabularyUtil {
  static readonly DEFAULT_TOKENIZE_ALGORITHM = DEFAULT_TOKENIZE_ALGORITHM;

  static tokenize(
    splitAlgorithm: SplitAlgorithm,
    alignmentList: readonly Alignment[],
    sourceVocabulary: Vocabulary,
    targetVocabulary: Vocabulary,
    sourceWidList: number[][],
    targetWidList: number[][]
  ): void {
    tokenizeAndBuildVocabulary(
      splitAlgorithm,
      alignmentList,
      sourceVocabulary,
      targetVocabulary,
      sourceWidList,
      targetWidList
    );
  }

  static createTruncatedVocabulary(
    widListList: number[][],
    vocabulary: Vocabulary
  ): Vocabulary {
    return createTruncatedVocabulary(widListList, vocabulary);
  }
}

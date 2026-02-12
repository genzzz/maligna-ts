import { Alignment } from '../../coretypes/Alignment';
import { Vocabulary } from './Vocabulary';
import { ModifyAlgorithm } from '../../filter/modifier/modify/ModifyAlgorithm';
import { FilterNonWordsSplitAlgorithmDecorator } from '../../filter/modifier/modify/split';
import { WordSplitAlgorithm } from '../../filter/modifier/modify/split';

export const DEFAULT_MAX_WORD_COUNT = 5000;
export const DEFAULT_MIN_OCCURRENCE_COUNT = 2;

/**
 * Default tokenize algorithm — WordSplitAlgorithm wrapped with FilterNonWords.
 */
export const DEFAULT_TOKENIZE_ALGORITHM: ModifyAlgorithm =
  new FilterNonWordsSplitAlgorithmDecorator(new WordSplitAlgorithm());

/**
 * Tokenizes alignment list, populating vocabularies and returning word ID lists.
 */
export function tokenize(
  algorithm: ModifyAlgorithm,
  alignmentList: Alignment[],
  sourceVocabulary: Vocabulary,
  targetVocabulary: Vocabulary,
  sourceWidList: number[][],
  targetWidList: number[][]
): void {
  for (const alignment of alignmentList) {
    const sourceWords = algorithm.modify(alignment.sourceSegmentList);
    sourceVocabulary.putWordList(sourceWords);
    sourceWidList.push(sourceVocabulary.getWidList(sourceWords));

    const targetWords = algorithm.modify(alignment.targetSegmentList);
    targetVocabulary.putWordList(targetWords);
    targetWidList.push(targetVocabulary.getWidList(targetWords));
  }
}

/**
 * Creates a truncated vocabulary keeping only the most frequent words.
 */
export function createTruncatedVocabulary(
  widList: number[][],
  vocabulary: Vocabulary,
  maxWordCount: number = DEFAULT_MAX_WORD_COUNT,
  minOccurrenceCount: number = DEFAULT_MIN_OCCURRENCE_COUNT
): Vocabulary {
  // Count occurrences
  const occurrenceMap = new Map<number, number>();
  for (const wids of widList) {
    for (const wid of wids) {
      occurrenceMap.set(wid, (occurrenceMap.get(wid) || 0) + 1);
    }
  }

  // Sort by occurrence count descending
  const sortedEntries = [...occurrenceMap.entries()]
    .filter(([wid, count]) => wid !== Vocabulary.NULL_WID && count >= minOccurrenceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWordCount);

  // Build new vocabulary
  const newVocabulary = new Vocabulary();
  for (const [wid] of sortedEntries) {
    const word = vocabulary.getWord(wid);
    newVocabulary.putWord(word);
  }

  return newVocabulary;
}

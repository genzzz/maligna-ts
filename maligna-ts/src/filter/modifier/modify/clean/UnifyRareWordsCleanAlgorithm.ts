import { CleanAlgorithm } from './CleanAlgorithm.js';
import { SplitAlgorithm } from '../split/SplitAlgorithm.js';
import { WordSplitAlgorithm } from '../split/WordSplitAlgorithm.js';
import { Vocabulary } from '../../../../model/vocabulary/Vocabulary.js';

/**
 * Represents clean algorithm changing all words in segments that are not
 * present in given vocabulary to given string (in other words replacing
 * all unknown words with predefined string).
 * 
 * To split segments into words uses given splitting algorithm or default,
 * simple one.
 */
export class UnifyRareWordsCleanAlgorithm extends CleanAlgorithm {
  static readonly DEFAULT_OTHER_WORD = '{OTHER}';

  private vocabulary: Vocabulary;
  private splitAlgorithm: SplitAlgorithm;
  private otherWord: string;

  /**
   * Creates algorithm.
   * @param vocabulary vocabulary containing known words
   * @param splitAlgorithm algorithm used to split segment into words
   * @param otherWord string that will be used to replace unknown words
   */
  constructor(
    vocabulary: Vocabulary,
    splitAlgorithm: SplitAlgorithm = new WordSplitAlgorithm(),
    otherWord: string = UnifyRareWordsCleanAlgorithm.DEFAULT_OTHER_WORD
  ) {
    super();
    this.vocabulary = vocabulary;
    this.splitAlgorithm = splitAlgorithm;
    this.otherWord = otherWord;
  }

  /**
   * Cleans a segment. Result contains all words separated by a single space.
   * @param segment input segment
   * @returns cleaned segment
   */
  clean(segment: string): string | null {
    const wordList = this.splitAlgorithm.split(segment);
    const resultSegment: string[] = [];
    for (const word of wordList) {
      if (this.vocabulary.containsWord(word)) {
        resultSegment.push(word);
      } else {
        resultSegment.push(this.otherWord);
      }
    }
    return resultSegment.join(' ');
  }
}

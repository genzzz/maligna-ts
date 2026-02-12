import { describe, test, expect } from 'vitest';
import { Vocabulary } from '../../../src/model/vocabulary/Vocabulary';
import { createTruncatedVocabulary } from '../../../src/model/vocabulary/VocabularyUtil';
import { createWidList } from '../../util/TestUtil';

describe('VocabularyUtilTest', () => {
  const WID_LIST = createWidList([
    [1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3],
    [4, 4, 4, 5, 5, 6]
  ]);

  function createVocabulary(): Vocabulary {
    const vocabulary = new Vocabulary();
    vocabulary.putWord('aaa'); // wid 1
    vocabulary.putWord('bbb'); // wid 2
    vocabulary.putWord('ccc'); // wid 3
    vocabulary.putWord('ddd'); // wid 4
    vocabulary.putWord('eee'); // wid 5
    vocabulary.putWord('fff'); // wid 6
    return vocabulary;
  }

  const MAX_WORD_COUNT_1 = 10;
  const MIN_OCCURRENCE_COUNT_1 = 3;
  const EXPECTED_TRUNCATED_VOCABULARY_1 = ['aaa', 'bbb', 'ccc', 'ddd'];

  test('testCreateTruncatedVocabularyMinOccurenceCount', () => {
    const vocabulary = createVocabulary();
    const truncatedVocabulary = createTruncatedVocabulary(
      WID_LIST,
      vocabulary,
      MAX_WORD_COUNT_1,
      MIN_OCCURRENCE_COUNT_1
    );
    assertVocabularyEquals(EXPECTED_TRUNCATED_VOCABULARY_1, truncatedVocabulary);
  });

  const MAX_WORD_COUNT_2 = 3;
  const MIN_OCCURRENCE_COUNT_2 = 1;
  const EXPECTED_TRUNCATED_VOCABULARY_2 = ['aaa', 'bbb', 'ccc'];

  test('testCreateTruncatedVocabularyMaxWordCount', () => {
    const vocabulary = createVocabulary();
    const truncatedVocabulary = createTruncatedVocabulary(
      WID_LIST,
      vocabulary,
      MAX_WORD_COUNT_2,
      MIN_OCCURRENCE_COUNT_2
    );
    assertVocabularyEquals(EXPECTED_TRUNCATED_VOCABULARY_2, truncatedVocabulary);
  });

  const MAX_WORD_COUNT_3 = 0;
  const MIN_OCCURRENCE_COUNT_3 = 3;
  const EXPECTED_TRUNCATED_VOCABULARY_3: string[] = [];

  test('testCreateTruncatedVocabularyMaxWordsZero', () => {
    const vocabulary = createVocabulary();
    const truncatedVocabulary = createTruncatedVocabulary(
      WID_LIST,
      vocabulary,
      MAX_WORD_COUNT_3,
      MIN_OCCURRENCE_COUNT_3
    );
    assertVocabularyEquals(EXPECTED_TRUNCATED_VOCABULARY_3, truncatedVocabulary);
  });

  function assertVocabularyEquals(
    wordArray: string[],
    vocabulary: Vocabulary
  ): void {
    // Size includes NULL word, so subtract 1 for comparison
    expect(vocabulary.size() - 1).toBe(wordArray.length);
  }
});

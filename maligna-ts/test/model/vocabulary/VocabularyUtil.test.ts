import { Vocabulary } from '../../../src/model/vocabulary/Vocabulary';
import { createTruncatedVocabulary } from '../../../src/model/vocabulary/VocabularyUtil';

/**
 * Represents vocabulary utilities test suite.
 */
describe('VocabularyUtil', () => {
  const WID_LIST: number[][] = [
    [1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3],
    [4, 4, 4, 5, 5, 6],
  ];

  const VOCABULARY = new Vocabulary([
    'aaa',
    'bbb',
    'ccc',
    'ddd',
    'eee',
    'fff',
  ]);

  /**
   * Tests whether createTruncatedVocabulary works as expected
   * in regard to filtering infrequent words.
   */
  test('testCreateTruncatedVocabulary', () => {
    const truncatedVocabulary = createTruncatedVocabulary(
      WID_LIST,
      VOCABULARY
    );
    // Words with count >= 2 should be included
    // aaa: 4, bbb: 5, ccc: 3, ddd: 3, eee: 2, fff: 1
    // Expected: aaa, bbb, ccc, ddd, eee (5 words, excluding fff)
    // Note: The truncated vocabulary will contain these + NULL_WORD
    expect(truncatedVocabulary.containsWord('aaa')).toBe(true);
    expect(truncatedVocabulary.containsWord('bbb')).toBe(true);
    expect(truncatedVocabulary.containsWord('ccc')).toBe(true);
    expect(truncatedVocabulary.containsWord('ddd')).toBe(true);
    expect(truncatedVocabulary.containsWord('eee')).toBe(true);
    expect(truncatedVocabulary.containsWord('fff')).toBe(false);
  });
});

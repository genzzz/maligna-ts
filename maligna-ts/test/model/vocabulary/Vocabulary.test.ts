import { Vocabulary } from '../../../src/model/vocabulary/Vocabulary';

/**
 * Represents Vocabulary unit test.
 */
describe('Vocabulary', () => {
  /**
   * Performs various tests on vocabulary including adding words, getting
   * the word ids, etc.
   */
  test('testVocabulary', () => {
    const vocabulary = new Vocabulary();
    expect(vocabulary.containsWord('a b')).toBe(false);
    expect(vocabulary.getWid('a b')).toBeNull();
    expect(vocabulary.containsWid(Vocabulary.NULL_WID)).toBe(true);
    expect(vocabulary.containsWid(10)).toBe(false);
    expect(vocabulary.getWordCount()).toBe(1); // Just the NULL_WORD
    vocabulary.putWord('a b');
    expect(vocabulary.getWordCount()).toBe(2);
    expect(vocabulary.containsWord('a b')).toBe(true);
    const wid = vocabulary.getWid('a b');
    expect(wid).toBe(1);
    expect(vocabulary.containsWid(wid!)).toBe(true);
    expect(vocabulary.getWord(wid!)).toBe('a b');
  });
});

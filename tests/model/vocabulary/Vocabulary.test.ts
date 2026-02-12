import { describe, test, expect } from 'vitest';
import { Vocabulary } from '../../../src/model/vocabulary/Vocabulary';

describe('VocabularyTest', () => {
  test('testVocabulary', () => {
    const vocabulary = new Vocabulary();
    expect(vocabulary.containsWord('a b')).toBe(false);
    expect(vocabulary.getWid('a b')).toBe(Vocabulary.NULL_WID);
    expect(vocabulary.size() > 0).toBe(true); // contains NULL
    vocabulary.putWord('a b');
    expect(vocabulary.containsWord('a b')).toBe(true);
    const wid = vocabulary.getWid('a b');
    expect(wid).toBe(1);
    expect(vocabulary.getWord(wid)).toBe('a b');
  });
});

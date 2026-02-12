import { describe, test, expect } from 'vitest';
import { WordSplitAlgorithm } from '../../../../../src/filter/modifier/modify/split/WordSplitAlgorithm';

describe('WordSplitAlgorithmTest', () => {
  const SPACE = '  ab\t 9\net ';
  const EXPECTED_SPACE = ['ab', '9', 'et'];

  test('splitSpace', () => {
    const splitter = new WordSplitAlgorithm();
    const wordList = splitter.split(SPACE);
    expect(wordList).toEqual(EXPECTED_SPACE);
  });

  const PUNCTUATION = '1. Ja, niżej  podpisan(I\'m "batman01").';
  const EXPECTED_PUNCTUATION = [
    '1', '.', 'Ja', ',', 'niżej', 'podpisan', '(', 'I', '\'', 'm',
    '"', 'batman01', '"', ')', '.'
  ];

  test('splitPunctuation', () => {
    const splitter = new WordSplitAlgorithm();
    const wordList = splitter.split(PUNCTUATION);
    expect(wordList).toEqual(EXPECTED_PUNCTUATION);
  });
});

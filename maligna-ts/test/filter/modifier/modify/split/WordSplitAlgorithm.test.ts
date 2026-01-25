import { WordSplitAlgorithm } from '../../../../../src/filter/modifier/modify/split/WordSplitAlgorithm';

/**
 * Represents WordSplitAlgorithm unit test.
 */
describe('WordSplitAlgorithm', () => {
  const SPACE = '  ab\t 9\net ';

  const EXPECTED_SPACE = ['ab', '9', 'et'];

  /**
   * Checks if splitting on whitespace works as expected and that whitespace
   * characters are removed from the output.
   */
  test('splitSpace', () => {
    const splitter = new WordSplitAlgorithm();
    const wordList = splitter.split(SPACE);
    expect(wordList).toEqual(EXPECTED_SPACE);
  });

  const PUNCTUATION = '1. Ja, niżej  podpisan(I\'m "batman01").';

  const EXPECTED_PUNCTUATION = [
    '1',
    '.',
    'Ja',
    ',',
    'niżej',
    'podpisan',
    '(',
    'I',
    "'",
    'm',
    '"',
    'batman01',
    '"',
    ')',
    '.',
  ];

  /**
   * Checks if splitting after punctuation characters works as expected.
   */
  test('splitPunctuation', () => {
    const splitter = new WordSplitAlgorithm();
    const wordList = splitter.split(PUNCTUATION);
    expect(wordList).toEqual(EXPECTED_PUNCTUATION);
  });
});

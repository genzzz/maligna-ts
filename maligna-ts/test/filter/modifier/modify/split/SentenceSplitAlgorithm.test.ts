import { SentenceSplitAlgorithm } from '../../../../../src/filter/modifier/modify/split/SentenceSplitAlgorithm';

/**
 * Represents SentenceSplitAlgorithm unit test.
 */
describe('SentenceSplitAlgorithm', () => {
  const TEXT = 'Ala ma kota. Prof. Kot nie wie kim jest. Ech\nNic.';

  const SEGMENT_ARRAY = [
    'Ala ma kota.',
    ' Prof.',
    ' Kot nie wie kim jest.',
    ' Ech\n',
    'Nic.',
  ];

  let splitter: SentenceSplitAlgorithm;

  beforeEach(() => {
    splitter = new SentenceSplitAlgorithm();
  });

  /**
   * Tests simple split.
   */
  test('stringSplit', () => {
    const segmentList = splitter.split(TEXT);
    expect(segmentList).toEqual(SEGMENT_ARRAY);
  });
});

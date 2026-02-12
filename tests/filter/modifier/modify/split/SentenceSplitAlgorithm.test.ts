import { describe, test, expect, beforeEach } from 'vitest';
import { SentenceSplitAlgorithm } from '../../../../../src/filter/modifier/modify/split/SentenceSplitAlgorithm';

describe('SentenceSplitAlgorithmTest', () => {
  const TEXT = 'Ala ma kota. Prof. Kot nie wie kim jest. Ech\nNic.';

  const SEGMENT_ARRAY = [
    'Ala ma kota.',
    ' Prof.',
    ' Kot nie wie kim jest.',
    ' Ech\n',
    'Nic.'
  ];

  let splitter: SentenceSplitAlgorithm;

  beforeEach(() => {
    splitter = new SentenceSplitAlgorithm();
  });

  test('stringSplit', () => {
    const segmentList = splitter.split(TEXT);
    expect(segmentList).toEqual(SEGMENT_ARRAY);
  });
});

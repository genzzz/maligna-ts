import { describe, test, expect } from 'vitest';
import { SplitAlgorithmMock } from './SplitAlgorithmMock';
import { SeparatorMergeAlgorithm } from '../../../../../src/filter/modifier/modify/merge';

describe('SplitAlgorithmMockTest', () => {
  test('split', () => {
    const segments = ['aa', 'bb', 'c'];
    const merger = new SeparatorMergeAlgorithm('');
    const mergedResult = merger.modify(segments);
    const text = mergedResult[0];
    const splitter = new SplitAlgorithmMock(2);
    const splitted = splitter.split(text);
    expect(splitted).toEqual(segments);
  });
});

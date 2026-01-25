import { SeparatorMergeAlgorithm } from '../../../src/filter/modifier/modify/merge/SeparatorMergeAlgorithm';
import { SplitAlgorithmMock } from './modify/split/SplitAlgorithmMock';

/**
 * Tests SplitAlgorithmMock. This is a little paranoid because mock is
 * used for testing itself.
 */
describe('SplitAlgorithmMock', () => {
  test('split', () => {
    const segments = ['aa', 'bb', 'c'];
    const merger = new SeparatorMergeAlgorithm('');
    const text = merger.merge(segments);
    const splitter = new SplitAlgorithmMock(2);
    const splitted = splitter.split(text);
    expect(splitted).toEqual(segments);
  });
});

import { SeparatorMergeAlgorithm } from '../../../../../src/filter/modifier/modify/merge/SeparatorMergeAlgorithm';

/**
 * Represents SeparatorMergeAlgorithm unit test.
 */
describe('SeparatorMergeAlgorithm', () => {
  let merger: SeparatorMergeAlgorithm;

  beforeEach(() => {
    merger = new SeparatorMergeAlgorithm('  ');
  });

  /**
   * Check if merging empty list returns empty segment.
   */
  test('mergeEmpty', () => {
    const list: string[] = [];
    const segment = merger.merge(list);
    expect(segment).toBe('');
  });

  /**
   * Checks if merging a list containing just one segment
   * returns the same segment.
   */
  test('mergeSingleton', () => {
    const list = ['ala'];
    const segment = merger.merge(list);
    expect(segment).toBe('ala');
  });

  /**
   * Test merging with separator.
   */
  test('merge', () => {
    const list = ['ala', 'ma', ' kota'];
    const segment = merger.merge(list);
    expect(segment).toBe('ala  ma   kota');
  });

  /**
   * Tests merging without a separator - if the result will be
   * exactly the same as string concatenation.
   */
  test('mergeNoSeparator', () => {
    const emptyMerger = new SeparatorMergeAlgorithm('');
    const list = ['ala', 'ma', ' kota'];
    const segment = emptyMerger.merge(list);
    expect(segment).toBe('alama kota');
  });
});

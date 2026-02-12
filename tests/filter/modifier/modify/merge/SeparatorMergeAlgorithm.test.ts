import { describe, test, expect, beforeEach } from 'vitest';
import { SeparatorMergeAlgorithm } from '../../../../../src/filter/modifier/modify/merge';

describe('SeparatorMergeAlgorithmTest', () => {
  let merger: SeparatorMergeAlgorithm;

  beforeEach(() => {
    merger = new SeparatorMergeAlgorithm('  ');
  });

  test('mergeEmpty', () => {
    const list: string[] = [];
    const segment = merger.modify(list);
    expect(segment).toEqual([]);
  });

  test('mergeSingleton', () => {
    const list = ['ala'];
    const segment = merger.modify(list);
    expect(segment).toEqual(['ala']);
  });

  test('merge', () => {
    const list = ['ala', 'ma', ' kota'];
    const segment = merger.modify(list);
    expect(segment).toEqual(['ala  ma   kota']);
  });

  test('mergeNoSeparator', () => {
    const emptyMerger = new SeparatorMergeAlgorithm('');
    const list = ['ala', 'ma', ' kota'];
    const segment = emptyMerger.modify(list);
    expect(segment).toEqual(['alama kota']);
  });
});

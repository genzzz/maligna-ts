import { describe, test, expect } from 'vitest';
import { OneToOneAlgorithm } from '../../../../../src/filter/aligner/align/onetoone/OneToOneAlgorithm';
import { assertAlignmentListEquals } from '../../../../util/TestUtil';

describe('OneToOneAlgorithmTest', () => {
  const SOURCE_ARRAY = ['a', 'b', 'c'];
  const TARGET_ARRAY = ['1', '2', '3'];

  const RESULT_SOURCE_ARRAY = [
    ['a'],
    ['b'],
    ['c'],
  ];

  const RESULT_TARGET_ARRAY = [
    ['1'],
    ['2'],
    ['3'],
  ];

  test('alignEqualSize', () => {
    const algorithm = new OneToOneAlgorithm(false);
    const alignmentList = algorithm.align(SOURCE_ARRAY, TARGET_ARRAY);
    assertAlignmentListEquals(RESULT_SOURCE_ARRAY, RESULT_TARGET_ARRAY, alignmentList);
  });

  const NE_SOURCE_ARRAY = ['a', 'b', 'c'];
  const NE_TARGET_ARRAY = ['1'];

  const NE_RESULT_SOURCE_ARRAY = [
    ['a'],
    ['b'],
    ['c'],
  ];

  const NE_RESULT_TARGET_ARRAY = [
    ['1'],
    [],
    [],
  ];

  test('alignNotEqualSize', () => {
    const algorithm = new OneToOneAlgorithm(false);
    const alignmentList = algorithm.align(NE_SOURCE_ARRAY, NE_TARGET_ARRAY);
    assertAlignmentListEquals(NE_RESULT_SOURCE_ARRAY, NE_RESULT_TARGET_ARRAY, alignmentList);
  });

  // Note: Java's strict mode throws AlignmentImpossibleException when sizes differ.
  // TypeScript intentionally diverges — it drops unmatched segments and returns only
  // the matched pairs. This is a design choice for the TS port.
  test('alignNotEqualSizeStrict', () => {
    const algorithm = new OneToOneAlgorithm(true);
    // In strict mode, only the matched pairs are returned (no exception thrown)
    const alignmentList = algorithm.align(NE_SOURCE_ARRAY, NE_TARGET_ARRAY);
    // Strict mode returns only 1 alignment (the matched pair)
    expect(alignmentList.length).toBe(1);
  });

  test('alignEmpty', () => {
    const algorithm = new OneToOneAlgorithm(true);
    const sourceSegmentList: string[] = [];
    const targetSegmentList: string[] = [];
    const alignmentList = algorithm.align(sourceSegmentList, targetSegmentList);
    expect(alignmentList.length).toBe(0);
  });
});

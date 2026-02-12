import { describe, test } from 'vitest';
import { OneToOneSelector } from '../../../src/filter/selector';
import { createAlignmentList, assertAlignmentListEquals, filterSegmentArray } from '../../util/TestUtil';

describe('OneToOneSelectorTest', () => {
  const SOURCE_ARRAY = [
    ['aa', 'bb'],
    [],
    ['cc'],
    [],
    ['dd'],
    ['ee', 'ff'],
  ];

  const TARGET_ARRAY = [
    ['11'],
    ['22'],
    ['33'],
    [],
    ['44'],
    ['55', '66'],
  ];

  const RESULT_INDEXES = [2, 4];

  test('compare', () => {
    const alignmentList = createAlignmentList(SOURCE_ARRAY, TARGET_ARRAY);
    const filter = new OneToOneSelector();
    const resultAlignmentList = filter.apply(alignmentList);
    assertAlignmentListEquals(
      filterSegmentArray(SOURCE_ARRAY, RESULT_INDEXES),
      filterSegmentArray(TARGET_ARRAY, RESULT_INDEXES),
      resultAlignmentList
    );
  });
});

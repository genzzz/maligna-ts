import { OneToOneSelector } from '../../../src/filter/selector/OneToOneSelector';
import {
  assertAlignmentListEquals,
  createAlignmentList,
  filterSegmentArray,
} from '../../util/TestUtil';

/**
 * Represents OneToOneSelector unit test.
 */
describe('OneToOneSelector', () => {
  const SOURCE_ARRAY: string[][] = [
    ['aa', 'bb'],
    [],
    ['cc'],
    [],
    ['dd'],
    ['ee', 'ff'],
  ];

  const TARGET_ARRAY: string[][] = [
    ['11'],
    ['22'],
    ['33'],
    [],
    ['44'],
    ['55', '66'],
  ];

  const RESULT_INDEXES = [2, 4];

  /**
   * Checks if selector leaves only and all one to one alignments.
   */
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

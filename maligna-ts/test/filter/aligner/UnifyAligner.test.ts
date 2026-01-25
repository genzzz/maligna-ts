import { Alignment } from '../../../src/coretypes/Alignment';
import { UnifyAligner } from '../../../src/filter/aligner/UnifyAligner';
import {
  assertAlignmentListEquals,
  createAlignmentList,
} from '../../util/TestUtil';

/**
 * Represents UnifyAligner unit test.
 */
describe('UnifyAligner', () => {
  const REFERENCE_SOURCE_SEGMENT_ARRAY: string[][] = [
    ['', ''],
    ['', '', ''],
    [''],
  ];

  const REFERENCE_TARGET_SEGMENT_ARRAY: string[][] = [[''], [''], ['', '']];

  const SOURCE_SEGMENT_ARRAY: string[][] = [
    ['a', 'b', 'c', 'd'],
    ['e', 'f'],
  ];

  const TARGET_SEGMENT_ARRAY: string[][] = [
    ['1', '2', '3'],
    ['4'],
  ];

  const EXPECTED_SOURCE_SEGMENT_ARRAY: string[][] = [
    ['a', 'b'],
    ['c', 'd', 'e'],
    ['f'],
  ];

  const EXPECTED_TARGET_SEGMENT_ARRAY: string[][] = [['1'], ['2'], ['3', '4']];

  /**
   * Checks whether unify aligner works as expected.
   */
  test('testAlign', () => {
    const referenceAlignmentList = createAlignmentList(
      REFERENCE_SOURCE_SEGMENT_ARRAY,
      REFERENCE_TARGET_SEGMENT_ARRAY
    );
    const aligner = new UnifyAligner(referenceAlignmentList);
    const alignmentList = createAlignmentList(
      SOURCE_SEGMENT_ARRAY,
      TARGET_SEGMENT_ARRAY
    );
    const resultAlignmentList = aligner.apply(alignmentList);
    assertAlignmentListEquals(
      EXPECTED_SOURCE_SEGMENT_ARRAY,
      EXPECTED_TARGET_SEGMENT_ARRAY,
      resultAlignmentList
    );
  });
});

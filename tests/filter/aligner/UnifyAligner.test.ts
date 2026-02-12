import { describe, test } from 'vitest';
import { UnifyAligner } from '../../../src/filter/aligner/UnifyAligner';
import { createAlignmentList, assertAlignmentListEquals } from '../../util/TestUtil';

describe('UnifyAlignerTest', () => {
  const REFERENCE_SOURCE_SEGMENT_ARRAY = [
    ['', ''],
    ['', '', ''],
    [''],
  ];

  const REFERENCE_TARGET_SEGMENT_ARRAY = [
    [''],
    [''],
    ['', ''],
  ];

  const SOURCE_SEGMENT_ARRAY = [
    ['a', 'b', 'c', 'd'],
    ['e', 'f']
  ];

  const TARGET_SEGMENT_ARRAY = [
    ['1', '2', '3'],
    ['4']
  ];

  const EXPECTED_SOURCE_SEGMENT_ARRAY = [
    ['a', 'b'],
    ['c', 'd', 'e'],
    ['f'],
  ];

  const EXPECTED_TARGET_SEGMENT_ARRAY = [
    ['1'],
    ['2'],
    ['3', '4'],
  ];

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

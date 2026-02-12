import { describe, test } from 'vitest';
import { Aligner } from '../../../src/filter/aligner/Aligner';
import { AlignAlgorithmMock } from './align/AlignAlgorithmMock';
import { createAlignmentList, assertAlignmentListEquals } from '../../util/TestUtil';

describe('AlignerTest', () => {
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
    ['c', 'd'],
    ['e', 'f'],
  ];

  const EXPECTED_TARGET_SEGMENT_ARRAY = [
    ['1', '2'],
    ['3'],
    ['4'],
  ];

  test('testAlign', () => {
    const algorithm = new AlignAlgorithmMock(2);
    const aligner = new Aligner(algorithm);
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

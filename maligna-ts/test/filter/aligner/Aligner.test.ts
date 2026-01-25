import { Aligner } from '../../../src/filter/aligner/Aligner';
import { AlignAlgorithmMock } from './align/AlignAlgorithmMock';
import {
  assertAlignmentListEquals,
  createAlignmentList,
} from '../../util/TestUtil';

/**
 * Represents unit test of Aligner class. Checks if it applies
 * AlignAlgorithm correctly using AlignAlgorithmMock.
 */
describe('Aligner', () => {
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
    ['c', 'd'],
    ['e', 'f'],
  ];

  const EXPECTED_TARGET_SEGMENT_ARRAY: string[][] = [['1', '2'], ['3'], ['4']];

  /**
   * Checks if Aligner uses AlignAlgorithm correctly.
   */
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

import { describe, test } from 'vitest';
import { Aligner } from '../../../src/filter/aligner/Aligner';
import { OneToOneAlgorithm } from '../../../src/filter/aligner/align/onetoone/OneToOneAlgorithm';
import { IgnoreInfiniteProbabilityAlignmentsFilterDecorator } from '../../../src/filter/meta';
import { Alignment } from '../../../src/coretypes/Alignment';
import { createAlignmentList, assertAlignmentListEquals } from '../../util/TestUtil';

describe('IgnoreInfiniteProbabilityAlignmentsFilterDecoratorTest', () => {
  const SOURCE_SEGMENT_ARRAY = [
    ['A', 'B'],
    ['X', 'Y'],
    ['C', 'D'],
  ];

  const TARGET_SEGMENT_ARRAY = [
    ['1', '2'],
    ['9', '8'],
    ['3', '4'],
  ];

  const EXPECTED_SOURCE_SEGMENT_ARRAY = [
    ['A'],
    ['B'],
    ['X', 'Y'],
    ['C'],
    ['D'],
  ];

  const EXPECTED_TARGET_SEGMENT_ARRAY = [
    ['1'],
    ['2'],
    ['9', '8'],
    ['3'],
    ['4'],
  ];

  test('testIgnoreInfiniteProbability', () => {
    const oneToOneAligner = new Aligner(new OneToOneAlgorithm());
    const filter = new IgnoreInfiniteProbabilityAlignmentsFilterDecorator(oneToOneAligner);

    // Create alignment list with middle alignment marked as fixed
    const alignments: Alignment[] = [];
    alignments.push(new Alignment(SOURCE_SEGMENT_ARRAY[0], TARGET_SEGMENT_ARRAY[0], 1.0));
    alignments.push(new Alignment(SOURCE_SEGMENT_ARRAY[1], TARGET_SEGMENT_ARRAY[1], -Infinity)); // Fixed
    alignments.push(new Alignment(SOURCE_SEGMENT_ARRAY[2], TARGET_SEGMENT_ARRAY[2], 1.0));

    const resultAlignmentList = filter.apply(alignments);
    assertAlignmentListEquals(
      EXPECTED_SOURCE_SEGMENT_ARRAY,
      EXPECTED_TARGET_SEGMENT_ARRAY,
      resultAlignmentList
    );
  });
});

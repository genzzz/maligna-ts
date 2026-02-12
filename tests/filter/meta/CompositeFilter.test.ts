import { describe, test } from 'vitest';
import { Aligner } from '../../../src/filter/aligner/Aligner';
import { OneToOneAlgorithm } from '../../../src/filter/aligner/align/onetoone/OneToOneAlgorithm';
import { Modifier } from '../../../src/filter/modifier/Modifier';
import { CompositeFilter } from '../../../src/filter/meta';
import { SeparatorMergeAlgorithm } from '../../../src/filter/modifier/modify/merge';
import { AlignAlgorithmMock } from '../aligner/align/AlignAlgorithmMock';
import { SplitAlgorithmMock } from '../../filter/modifier/modify/split/SplitAlgorithmMock';
import { createAlignmentList, assertAlignmentListEquals } from '../../util/TestUtil';

describe('CompositeFilterTest', () => {
  const SOURCE_SEGMENT_ARRAY = [['abcdef']];
  const TARGET_SEGMENT_ARRAY = [['12345']];

  const EXPECTED_SOURCE_SEGMENT_ARRAY = [
    ['ab'],
    ['cd'],
    ['ef'],
  ];

  const EXPECTED_TARGET_SEGMENT_ARRAY = [
    ['12'],
    ['34'],
    ['5'],
  ];

  test('testRunAllFilters', () => {
    const splitAlgorithm = new SplitAlgorithmMock(1);
    const alignAlgorithm = new AlignAlgorithmMock(2);
    const mergeAlgorithm = new SeparatorMergeAlgorithm();

    const filterList = [
      new Modifier(splitAlgorithm, splitAlgorithm),
      new Aligner(alignAlgorithm),
      new Modifier(mergeAlgorithm, mergeAlgorithm),
    ];

    const composite = new CompositeFilter(filterList);
    const alignmentList = createAlignmentList(
      SOURCE_SEGMENT_ARRAY,
      TARGET_SEGMENT_ARRAY
    );
    const resultAlignmentList = composite.apply(alignmentList);
    assertAlignmentListEquals(
      EXPECTED_SOURCE_SEGMENT_ARRAY,
      EXPECTED_TARGET_SEGMENT_ARRAY,
      resultAlignmentList
    );
  });
});

import { CompositeFilter } from '../../../src/filter/meta/CompositeFilter';
import { Modifier } from '../../../src/filter/modifier/Modifier';
import { Aligner } from '../../../src/filter/aligner/Aligner';
import { SeparatorMergeAlgorithm } from '../../../src/filter/modifier/modify/merge/SeparatorMergeAlgorithm';
import { Filter } from '../../../src/filter/Filter';
import { SplitAlgorithmMock } from '../modifier/modify/split/SplitAlgorithmMock';
import { AlignAlgorithmMock } from '../aligner/align/AlignAlgorithmMock';
import {
  assertAlignmentListEquals,
  createAlignmentList,
} from '../../util/TestUtil';

/**
 * Represents CompositeFilter unit test.
 */
describe('CompositeFilter', () => {
  const SOURCE_SEGMENT_ARRAY: string[][] = [['abcdef']];

  const TARGET_SEGMENT_ARRAY: string[][] = [['12345']];

  const EXPECTED_SOURCE_SEGMENT_ARRAY: string[][] = [['ab'], ['cd'], ['ef']];

  const EXPECTED_TARGET_SEGMENT_ARRAY: string[][] = [['12'], ['34'], ['5']];

  /**
   * Creates a composite filter consisting of
   * SplitAlgorithmMock filter, AlignAlgorithmMock filter and
   * SeparatorMergeAlgorithm, applies the filter and checks
   * if the results are correct.
   */
  test('testRunAllFilters', () => {
    const splitAlgorithm = new SplitAlgorithmMock(2);
    const alignAlgorithm = new AlignAlgorithmMock(1);
    const mergeAlgorithm = new SeparatorMergeAlgorithm();
    const filterList: Filter[] = [];
    filterList.push(new Modifier(splitAlgorithm, splitAlgorithm));
    filterList.push(new Aligner(alignAlgorithm));
    filterList.push(new Modifier(mergeAlgorithm, mergeAlgorithm));
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

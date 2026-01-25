import { Alignment } from '../../../src/coretypes/Alignment';
import { FractionSelector } from '../../../src/filter/selector/FractionSelector';

/**
 * Represents FractionSelector unit test.
 */
describe('FractionSelector', () => {
  /**
   * Test of selecting from empty list returns empty list and does not
   * throw an exception.
   */
  test('testEmpty', () => {
    const filter = new FractionSelector(0.8);
    const alignmentList: Alignment[] = [];
    const result = filter.apply(alignmentList);
    expect(result.length).toBe(0);
  });

  /**
   * Test if a selecting from a list containing one element returns empty
   * list if fraction is < 0.5, and one element list if fraction >= 0.5.
   */
  test('testSingleton', () => {
    let filter: FractionSelector;
    const alignmentList: Alignment[] = [];
    let filteredAlignmentList: Alignment[];
    const alignment = new Alignment();
    alignment.score = 1.0;
    alignmentList.push(alignment);
    filter = new FractionSelector(0.4999);
    filteredAlignmentList = filter.apply(alignmentList);
    expect(filteredAlignmentList.length).toBe(0);
    filter = new FractionSelector(0.5);
    filteredAlignmentList = filter.apply(alignmentList);
    expect(filteredAlignmentList.length).toBe(1);
  });

  /**
   * Test if the list contains elements with identical score,
   * they will all be returned if fraction > 0.
   */
  test('testIdentical', () => {
    const filter = new FractionSelector(0.79);
    const alignmentList = createAlignmentList([2.0, 2.0, 2.0, 2.0, 2.0]);
    const result = filter.apply(alignmentList);
    expect(result.length).toBe(5);
  });

  /**
   * Tests if fraction selector selects correct number of elements.
   */
  test('testDifferent', () => {
    const filter = new FractionSelector(0.79);
    const alignmentList = createAlignmentList([1.0, 4.0, 2.0, 5.0, 2.0]);
    const result = filter.apply(alignmentList);
    expect(result.length).toBe(4);
  });

  /**
   * Helper function to create mock alignment list containing elements
   * with given scores.
   */
  function createAlignmentList(scoreArray: number[]): Alignment[] {
    const alignmentList: Alignment[] = [];
    for (const score of scoreArray) {
      const alignment = new Alignment();
      alignment.score = score;
      alignmentList.push(alignment);
    }
    return alignmentList;
  }
});

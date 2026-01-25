import { Alignment } from '../../src/coretypes/Alignment';

/**
 * Represents Alignment class test.
 */
describe('Alignment', () => {
  let sourceSegmentList: string[];
  let targetSegmentList: string[];

  beforeEach(() => {
    sourceSegmentList = [];
    targetSegmentList = [];
  });

  /**
   * Tests whether after calling the constructor lists stored in
   * Alignment are copies of the arguments.
   */
  test('constructor list copying', () => {
    const alignment = new Alignment(sourceSegmentList, targetSegmentList, 2.0);
    checkAlignment(alignment);
  });

  /**
   * Tests whether after calling addSourceSegmentList
   * and addTargetSegmentList methods, lists stored in
   * Alignment are copies of the arguments.
   */
  test('method list copying', () => {
    const alignment = new Alignment();
    alignment.addSourceSegmentList(sourceSegmentList);
    alignment.addTargetSegmentList(targetSegmentList);
    alignment.score = 2.0;
    checkAlignment(alignment);
  });

  function checkAlignment(alignment: Alignment): void {
    expect(alignment.sourceSegmentList.length).toBe(0);
    sourceSegmentList.push('a');
    expect(alignment.sourceSegmentList.length).toBe(0);
    expect(alignment.targetSegmentList.length).toBe(0);
    targetSegmentList.push('c');
    expect(alignment.targetSegmentList.length).toBe(0);
    expect(alignment.score).toBeCloseTo(2.0, 9);
  }
});

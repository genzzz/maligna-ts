import { AlignAlgorithmMock } from './align/AlignAlgorithmMock';
import { assertAlignmentEquals } from '../../util/TestUtil';

/**
 * Represents AlignAlgorithmMock unit test.
 */
describe('AlignAlgorithmMock', () => {
  /**
   * Checks if aligning empty lists returns empty list.
   */
  test('alignEmpty', () => {
    const aligner = new AlignAlgorithmMock(2);
    const segmentList: string[] = [];
    const alignmentList = aligner.align(segmentList, segmentList);
    expect(alignmentList.length).toBe(0);
  });

  /**
   * Checks whether mock aligner works as described.
   */
  test('align', () => {
    const aligner = new AlignAlgorithmMock(2);
    const sourceArray: string[][] = [
      ['a', 'b'],
      ['c', 'd'],
      ['e', 'f'],
    ];
    const targetArray: string[][] = [['1', '2'], ['3'], []];
    expect(sourceArray.length).toBe(targetArray.length);
    const alignmentCount = sourceArray.length;
    const sourceList = combine(sourceArray);
    const targetList = combine(targetArray);
    const alignmentList = aligner.align(sourceList, targetList);
    expect(alignmentList.length).toBe(alignmentCount);
    for (let i = 0; i < alignmentCount; i++) {
      assertAlignmentEquals(
        sourceArray[i]!,
        targetArray[i]!,
        alignmentList[i]!
      );
    }
  });

  /**
   * Creates a list of strings containing all strings from input
   * two dimensional array.
   */
  function combine(array: string[][]): string[] {
    const list: string[] = [];
    for (const group of array) {
      for (const element of group) {
        list.push(element);
      }
    }
    return list;
  }
});

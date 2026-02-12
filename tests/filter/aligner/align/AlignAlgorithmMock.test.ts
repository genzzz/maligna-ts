import { describe, test, expect } from 'vitest';
import { AlignAlgorithmMock } from './AlignAlgorithmMock';
import { assertAlignmentEquals } from '../../../util/TestUtil';

describe('AlignAlgorithmMockTest', () => {
  test('alignEmpty', () => {
    const aligner = new AlignAlgorithmMock(2);
    const segmentList: string[] = [];
    const alignmentList = aligner.align(segmentList, segmentList);
    expect(alignmentList.length).toBe(0);
  });

  test('align', () => {
    const aligner = new AlignAlgorithmMock(2);
    const sourceArray = [
      ['a', 'b'],
      ['c', 'd'],
      ['e', 'f']
    ];
    const targetArray = [
      ['1', '2'],
      ['3'],
      []
    ];
    expect(sourceArray.length).toBe(targetArray.length);
    const alignmentCount = sourceArray.length;
    const sourceList = combine(sourceArray);
    const targetList = combine(targetArray);
    const alignmentList = aligner.align(sourceList, targetList);
    expect(alignmentList.length).toBe(alignmentCount);
    for (let i = 0; i < alignmentCount; i++) {
      assertAlignmentEquals(sourceArray[i], targetArray[i], alignmentList[i]);
    }
  });

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

import { describe, test, expect } from 'vitest';
import { DifferenceSelector } from '../../../src/filter/selector';
import { Alignment } from '../../../src/coretypes/Alignment';

describe('DifferenceSelectorTest', () => {
  test('testSimple', () => {
    const leftAlignmentList: Alignment[] = [];
    leftAlignmentList.push(new Alignment(['a'], ['1']));
    leftAlignmentList.push(new Alignment(['b'], []));
    leftAlignmentList.push(new Alignment(['c'], ['3']));

    const rightAlignmentList: Alignment[] = [];
    rightAlignmentList.push(new Alignment(['a'], ['1']));
    rightAlignmentList.push(new Alignment(['b'], ['2']));
    rightAlignmentList.push(new Alignment(['c'], ['3']));

    const filter = new DifferenceSelector(rightAlignmentList);
    const resultAlignmentList = filter.apply(leftAlignmentList);

    expect(resultAlignmentList.length).toBe(1);
    expect(resultAlignmentList[0].equals(leftAlignmentList[1])).toBe(true);
  });
});

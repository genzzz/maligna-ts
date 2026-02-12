import { describe, test, expect } from 'vitest';
import { IntersectionSelector } from '../../../src/filter/selector';
import { Alignment } from '../../../src/coretypes/Alignment';

describe('IntersectionSelectorTest', () => {
  test('testSimple', () => {
    const leftAlignmentList: Alignment[] = [];
    leftAlignmentList.push(new Alignment(['a'], ['1']));
    leftAlignmentList.push(new Alignment(['b'], []));
    leftAlignmentList.push(new Alignment(['c'], ['3']));

    const rightAlignmentList: Alignment[] = [];
    rightAlignmentList.push(new Alignment(['a'], ['1']));
    rightAlignmentList.push(new Alignment(['b'], ['2']));
    rightAlignmentList.push(new Alignment(['c'], ['3']));

    const filter = new IntersectionSelector(rightAlignmentList);
    const resultAlignmentList = filter.apply(leftAlignmentList);

    expect(resultAlignmentList.length).toBe(2);
    expect(resultAlignmentList[0].equals(rightAlignmentList[0])).toBe(true);
    expect(resultAlignmentList[1].equals(rightAlignmentList[2])).toBe(true);
  });
});

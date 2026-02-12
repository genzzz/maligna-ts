import { describe, test, expect } from 'vitest';
import { compare, Diff } from '../../src/comparator';
import { Alignment } from '../../src/coretypes/Alignment';

describe('ComparatorTest', () => {
  test('testEmpty', () => {
    const leftAlignmentList = [new Alignment(['a'], ['b'])];
    const rightAlignmentList: Alignment[] = [];

    const diff = compare(leftAlignmentList, rightAlignmentList);

    expect(diff.commonList.length).toBe(0);
    expect(diff.leftGroupList.length).toBe(1);
    expect(diff.leftGroupList[0].length).toBe(1);
    expect(diff.rightGroupList.length).toBe(1);
    expect(diff.rightGroupList[0].length).toBe(0);
  });

  test('testSimple', () => {
    const leftAlignmentList: Alignment[] = [];
    leftAlignmentList.push(new Alignment(['a'], ['1']));
    leftAlignmentList.push(new Alignment(['b'], []));
    leftAlignmentList.push(new Alignment(['c'], ['3']));

    const rightAlignmentList: Alignment[] = [];
    rightAlignmentList.push(new Alignment(['a'], ['1']));
    rightAlignmentList.push(new Alignment(['b'], ['2']));
    rightAlignmentList.push(new Alignment(['c'], ['3']));

    const diff = compare(leftAlignmentList, rightAlignmentList);

    expect(diff.commonList.length).toBe(2);
    expect(diff.commonList[0].equals(rightAlignmentList[0])).toBe(true);
    expect(diff.commonList[1].equals(rightAlignmentList[2])).toBe(true);
    expect(diff.leftGroupList.length).toBe(1);
    expect(diff.leftGroupList[0]).toEqual(leftAlignmentList.slice(1, 2));
    expect(diff.rightGroupList.length).toBe(1);
    expect(diff.rightGroupList[0]).toEqual(rightAlignmentList.slice(1, 2));
  });

  test('testRepetitions', () => {
    const leftAlignmentList: Alignment[] = [];
    leftAlignmentList.push(new Alignment(['a'], ['1']));
    leftAlignmentList.push(new Alignment(['b'], ['2']));
    leftAlignmentList.push(new Alignment(['c'], ['3']));

    const rightAlignmentList: Alignment[] = [];
    rightAlignmentList.push(new Alignment(['a'], ['1']));
    rightAlignmentList.push(new Alignment(['b'], ['2']));
    rightAlignmentList.push(new Alignment(['a'], ['1']));
    rightAlignmentList.push(new Alignment(['c'], ['3']));

    const diff = compare(leftAlignmentList, rightAlignmentList);

    expect(diff.commonList.length).toBe(3);
    expect(diff.commonList[0].equals(rightAlignmentList[0])).toBe(true);
    expect(diff.commonList[1].equals(rightAlignmentList[1])).toBe(true);
    expect(diff.commonList[2].equals(rightAlignmentList[3])).toBe(true);
    expect(diff.leftGroupList.length).toBe(1);
    expect(diff.leftGroupList[0].length).toBe(0);
    expect(diff.rightGroupList.length).toBe(1);
    expect(diff.rightGroupList[0]).toEqual(rightAlignmentList.slice(2, 3));
  });

  test('testInversions', () => {
    const leftAlignmentList: Alignment[] = [];
    leftAlignmentList.push(new Alignment(['b'], ['2']));
    leftAlignmentList.push(new Alignment(['a'], ['1']));
    leftAlignmentList.push(new Alignment(['c'], ['3']));

    const rightAlignmentList: Alignment[] = [];
    rightAlignmentList.push(new Alignment(['a'], ['1']));
    rightAlignmentList.push(new Alignment(['b'], ['2']));
    rightAlignmentList.push(new Alignment(['c'], ['3']));

    const diff = compare(leftAlignmentList, rightAlignmentList);

    expect(diff.commonList.length).toBe(2);
    expect(diff.commonList[0].equals(rightAlignmentList[1])).toBe(true);
    expect(diff.commonList[1].equals(rightAlignmentList[2])).toBe(true);
    expect(diff.leftGroupList.length).toBe(2);
    expect(diff.leftGroupList[0].length).toBe(0);
    expect(diff.leftGroupList[1]).toEqual(leftAlignmentList.slice(1, 2));
    expect(diff.rightGroupList.length).toBe(2);
    expect(diff.rightGroupList[0]).toEqual(rightAlignmentList.slice(0, 1));
    expect(diff.rightGroupList[1].length).toBe(0);
  });
});

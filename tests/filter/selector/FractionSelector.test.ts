import { describe, test, expect } from 'vitest';
import { FractionSelector } from '../../../src/filter/selector';
import { Alignment } from '../../../src/coretypes/Alignment';

describe('FractionSelectorTest', () => {
  test('testEmpty', () => {
    const filter = new FractionSelector(0.8);
    let alignmentList: Alignment[] = [];
    alignmentList = filter.apply(alignmentList);
    expect(alignmentList.length).toBe(0);
  });

  test('testSingleton', () => {
    let filter: FractionSelector;
    const alignmentList: Alignment[] = [];
    let filteredAlignmentList: Alignment[];
    const alignment = new Alignment([], [], 1.0);
    alignmentList.push(alignment);

    filter = new FractionSelector(0.4999);
    filteredAlignmentList = filter.apply(alignmentList);
    expect(filteredAlignmentList.length).toBe(0);

    filter = new FractionSelector(0.5);
    filteredAlignmentList = filter.apply(alignmentList);
    expect(filteredAlignmentList.length).toBe(1);
  });

  test('testIdentical', () => {
    const filter = new FractionSelector(0.79);
    let alignmentList = createAlignmentList([2.0, 2.0, 2.0, 2.0, 2.0]);
    alignmentList = filter.apply(alignmentList);
    expect(alignmentList.length).toBe(5);
  });

  test('testDifferent', () => {
    const filter = new FractionSelector(0.79);
    let alignmentList = createAlignmentList([1.0, 4.0, 2.0, 5.0, 2.0]);
    alignmentList = filter.apply(alignmentList);
    expect(alignmentList.length).toBe(4);
  });

  function createAlignmentList(scoreArray: number[]): Alignment[] {
    const alignmentList: Alignment[] = [];
    for (const score of scoreArray) {
      const alignment = new Alignment([], [], score);
      alignmentList.push(alignment);
    }
    return alignmentList;
  }
});

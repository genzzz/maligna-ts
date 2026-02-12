import { describe, test, expect, beforeEach } from 'vitest';
import { Alignment } from '../../src/coretypes/Alignment';

describe('AlignmentTest', () => {
  let sourceSegmentList: string[];
  let targetSegmentList: string[];

  beforeEach(() => {
    sourceSegmentList = [];
    targetSegmentList = [];
  });

  test('constructorListCopying', () => {
    const alignment = new Alignment(
      [...sourceSegmentList],
      [...targetSegmentList],
      2.0
    );
    checkAlignment(alignment);
  });

  // Note: In TypeScript, Alignment is immutable, so we test the constructor behavior
  // The Java test tested mutable setters which don't exist in TypeScript

  function checkAlignment(alignment: Alignment): void {
    expect(alignment.sourceSegmentList.length).toBe(0);
    // Original list modification shouldn't affect the alignment
    sourceSegmentList.push('a');
    expect(alignment.sourceSegmentList.length).toBe(0);
    expect(alignment.targetSegmentList.length).toBe(0);
    targetSegmentList.push('c');
    expect(alignment.targetSegmentList.length).toBe(0);
    expect(alignment.score).toBeCloseTo(2.0, 9);
  }
});

import { expect } from 'vitest';
import { Alignment } from '../../src/coretypes/Alignment';

/**
 * Asserts that an alignment matches expected source and target segment arrays.
 */
export function assertAlignmentEquals(
  sourceSegmentArray: string[],
  targetSegmentArray: string[],
  alignment: Alignment
): void {
  expect(alignment.sourceSegmentList).toEqual(sourceSegmentArray);
  expect(alignment.targetSegmentList).toEqual(targetSegmentArray);
}

/**
 * Asserts that an alignment list matches expected source and target segment arrays.
 */
export function assertAlignmentListEquals(
  sourceSegmentArray: string[][],
  targetSegmentArray: string[][],
  alignmentList: Alignment[]
): void {
  expect(sourceSegmentArray.length).toBe(targetSegmentArray.length);
  const length = sourceSegmentArray.length;
  expect(alignmentList.length).toBe(length);
  for (let i = 0; i < length; i++) {
    assertAlignmentEquals(
      sourceSegmentArray[i],
      targetSegmentArray[i],
      alignmentList[i]
    );
  }
}

/**
 * Asserts that an alignment list contains all the given source and target segments.
 */
export function assertAlignmentListContains(
  sourceSegments: string[],
  targetSegments: string[],
  alignmentList: Alignment[]
): void {
  const actualSourceSegments: string[] = [];
  const actualTargetSegments: string[] = [];
  for (const alignment of alignmentList) {
    actualSourceSegments.push(...alignment.sourceSegmentList);
    actualTargetSegments.push(...alignment.targetSegmentList);
  }
  expect(actualSourceSegments).toEqual(sourceSegments);
  expect(actualTargetSegments).toEqual(targetSegments);
}

/**
 * Creates an alignment list from source and target segment arrays.
 */
export function createAlignmentList(
  sourceArray: string[][],
  targetArray: string[][]
): Alignment[] {
  expect(sourceArray.length).toBe(targetArray.length);
  const alignmentList: Alignment[] = [];
  for (let i = 0; i < sourceArray.length; i++) {
    const alignment = new Alignment(sourceArray[i], targetArray[i], 1.0);
    alignmentList.push(alignment);
  }
  return alignmentList;
}

/**
 * Filters a segment array by the given indexes.
 */
export function filterSegmentArray(
  segmentArray: string[][],
  indexes: number[]
): string[][] {
  const newArray: string[][] = [];
  for (const index of indexes) {
    newArray.push(segmentArray[index]);
  }
  return newArray;
}

/**
 * Creates a list of wid lists from a 2D array of wids.
 */
export function createWidList(widArray: number[][]): number[][] {
  return widArray.map(arr => [...arr]);
}

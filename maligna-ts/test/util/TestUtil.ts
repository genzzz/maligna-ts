import { Alignment } from '../../src/coretypes/Alignment';

/**
 * Testing utility functions.
 */

/**
 * Asserts that given alignment consists of given source and
 * target segments. If not then exception is thrown. Used for unit testing.
 */
export function assertAlignmentEquals(
  sourceSegmentArray: string[],
  targetSegmentArray: string[],
  alignment: Alignment
): void {
  const sourceSegmentList = alignment.sourceSegmentList;
  const targetSegmentList = alignment.targetSegmentList;
  expect(sourceSegmentList).toEqual(sourceSegmentArray);
  expect(targetSegmentList).toEqual(targetSegmentArray);
}

/**
 * Asserts that alignments on a given list consists of given source and
 * target segments in given arrays. If not then exception is thrown.
 */
export function assertAlignmentListEquals(
  sourceSegmentArray: string[][],
  targetSegmentArray: string[][],
  alignmentList: Alignment[]
): void {
  expect(sourceSegmentArray.length).toEqual(targetSegmentArray.length);
  const length = sourceSegmentArray.length;
  expect(alignmentList.length).toEqual(length);
  for (let i = 0; i < length; i++) {
    assertAlignmentEquals(
      sourceSegmentArray[i]!,
      targetSegmentArray[i]!,
      alignmentList[i]!
    );
  }
}

/**
 * Asserts that given alignment list consists only from given
 * source and target segments in the same order.
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
 * Creates alignment list from segments read from given source and target
 * segment arrays. Array sizes must be equal, the resulting list will have
 * the same size. Used for unit testing.
 */
export function createAlignmentList(
  sourceArray: string[][],
  targetArray: string[][]
): Alignment[] {
  expect(sourceArray.length).toEqual(targetArray.length);
  const alignmentList: Alignment[] = [];
  const alignmentCount = sourceArray.length;
  for (let i = 0; i < alignmentCount; i++) {
    const alignment = new Alignment(sourceArray[i]!, targetArray[i]!, 1.0);
    alignmentList.push(alignment);
  }
  return alignmentList;
}

/**
 * Returns array of segments containing only alignments with indexes
 * specified in indexes array from given segment array.
 * Used for unit testing.
 */
export function filterSegmentArray(
  segmentArray: string[][],
  indexes: number[]
): string[][] {
  const newArray: string[][] = [];
  for (let i = 0; i < indexes.length; i++) {
    newArray.push(segmentArray[indexes[i]!]!);
  }
  return newArray;
}

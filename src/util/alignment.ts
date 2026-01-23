import { Alignment } from '../core/Alignment.js';

/**
 * Merges a string list into a single string.
 */
export function mergeStrings(stringList: string[]): string {
  return stringList.join('');
}

/**
 * Creates alignment list containing one alignment with given source segments and no target segments.
 */
export function alignManyToZero(sourceSegmentList: string[]): Alignment[] {
  const alignment = new Alignment();
  alignment.addSourceSegmentList(sourceSegmentList);
  return [alignment];
}

/**
 * Creates alignment list containing one alignment with no source segments and given target segments.
 */
export function alignZeroToMany(targetSegmentList: string[]): Alignment[] {
  const alignment = new Alignment();
  alignment.addTargetSegmentList(targetSegmentList);
  return [alignment];
}

/**
 * Creates alignment list containing one alignment with given source and target segments.
 */
export function alignManyToMany(
  sourceSegmentList: string[],
  targetSegmentList: string[]
): Alignment[] {
  return [new Alignment(sourceSegmentList, targetSegmentList, 0.0)];
}

/**
 * Extracts all source segments from an alignment list.
 */
export function extractSourceSegments(alignmentList: Alignment[]): string[] {
  const segments: string[] = [];
  for (const alignment of alignmentList) {
    segments.push(...alignment.getSourceSegmentList());
  }
  return segments;
}

/**
 * Extracts all target segments from an alignment list.
 */
export function extractTargetSegments(alignmentList: Alignment[]): string[] {
  const segments: string[] = [];
  for (const alignment of alignmentList) {
    segments.push(...alignment.getTargetSegmentList());
  }
  return segments;
}

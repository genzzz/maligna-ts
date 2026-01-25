import { Alignment } from '../coretypes/Alignment.js';

/**
 * General purpose utility functions.
 */

export const READ_BUFFER_SIZE = 1024;

/**
 * Creates alignment list containing one alignment. This alignment
 * contains given source segments and no target segments.
 */
export function alignManyToZero(sourceSegmentList: string[]): Alignment[] {
  const alignment = new Alignment();
  alignment.addSourceSegmentList(sourceSegmentList);
  return [alignment];
}

/**
 * Creates alignment list containing one alignment. This alignment
 * contains no source segments and given target segments.
 */
export function alignZeroToMany(targetSegmentList: string[]): Alignment[] {
  const alignment = new Alignment();
  alignment.addTargetSegmentList(targetSegmentList);
  return [alignment];
}

/**
 * Creates alignment list containing one alignment. This alignment contains
 * given source and target segments.
 */
export function alignManyToMany(
  sourceSegmentList: string[],
  targetSegmentList: string[]
): Alignment[] {
  const alignment = new Alignment(sourceSegmentList, targetSegmentList, 0.0);
  return [alignment];
}

/**
 * Converts probability to score. The score is more accurate for calculations.
 * score = -ln(probability)
 */
export function toScore(probability: number): number {
  return -Math.log(probability);
}

/**
 * Converts score to probability. The probability is easier to understand
 * by humans than score.
 * probability = e^(-score)
 */
export function toProbability(score: number): number {
  return Math.exp(-score);
}

/**
 * Calculates a sum of probabilities. The probabilities are given
 * as score and the result is returned as score as well. Takes care
 * to preserve maximum precision.
 */
export function scoreSum(scoreList: number[]): number {
  if (scoreList.length === 0) {
    return 0.0;
  }

  const minScore = Math.min(...scoreList);
  if (minScore === Infinity) {
    return Infinity;
  }

  let probabilitySum = 0.0;
  for (const score of scoreList) {
    const probability = toProbability(score - minScore);
    probabilitySum += probability;
  }

  const probabilityScore = toScore(probabilitySum);
  return minScore + probabilityScore;
}

/**
 * Merges a string list into a single string without inserting any extra
 * characters between strings.
 */
export function merge(stringList: string[]): string {
  return stringList.join('');
}

/**
 * Rounds a given number to a given precision places after decimal point.
 */
export function round(num: number, precision: number): number {
  const cutter = Math.pow(10, precision);
  return Math.floor(num * cutter) / cutter;
}

/**
 * Reads all content from a string (convenience method for TypeScript port).
 */
export function readAll(content: string): string {
  return content;
}

import { ModifyAlgorithm } from '../ModifyAlgorithm';

/**
 * Abstract split algorithm that splits each segment into sub-segments.
 */
export abstract class SplitAlgorithm implements ModifyAlgorithm {
  modify(segmentList: string[]): string[] {
    const result: string[] = [];
    for (const segment of segmentList) {
      const split = this.split(segment);
      result.push(...split);
    }
    return result;
  }

  abstract split(segment: string): string[];
}

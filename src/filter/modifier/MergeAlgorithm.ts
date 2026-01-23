import { ModifyAlgorithm } from './ModifyAlgorithm.js';

/**
 * Abstract base class for merge algorithms.
 * Merges multiple segments into fewer segments.
 */
export abstract class MergeAlgorithm implements ModifyAlgorithm {
  abstract modify(segmentList: readonly string[]): string[];
}

/**
 * Merges all segments into a single segment.
 */
export class MergeAllAlgorithm extends MergeAlgorithm {
  private readonly separator: string;

  constructor(separator: string = ' ') {
    super();
    this.separator = separator;
  }

  modify(segmentList: readonly string[]): string[] {
    if (segmentList.length === 0) {
      return [];
    }
    return [segmentList.join(this.separator)];
  }
}

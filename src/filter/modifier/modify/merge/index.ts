import { ModifyAlgorithm } from '../ModifyAlgorithm';

/**
 * Abstract merge algorithm — merges all segments into one.
 */
export abstract class MergeAlgorithm implements ModifyAlgorithm {
  abstract modify(segmentList: string[]): string[];
}

/**
 * Merges all segments into one, separated by a given separator string.
 */
export class SeparatorMergeAlgorithm extends MergeAlgorithm {
  private separator: string;

  constructor(separator: string = '') {
    super();
    this.separator = separator;
  }

  modify(segmentList: string[]): string[] {
    if (segmentList.length === 0) {
      return [];
    }
    return [segmentList.join(this.separator)];
  }
}

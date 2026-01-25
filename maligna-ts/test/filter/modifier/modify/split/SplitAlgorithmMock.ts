import { SplitAlgorithm } from '../../../../../src/filter/modifier/modify/split/SplitAlgorithm';

/**
 * Mock split algorithm for testing purposes.
 * Splits string into groups of given size.
 */
export class SplitAlgorithmMock extends SplitAlgorithm {
  private groupSize: number;

  constructor(groupSize: number) {
    super();
    this.groupSize = groupSize;
  }

  split(str: string): string[] {
    const result: string[] = [];
    for (let i = 0; i < str.length; i += this.groupSize) {
      result.push(str.substring(i, Math.min(i + this.groupSize, str.length)));
    }
    return result;
  }
}

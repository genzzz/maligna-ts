import { SplitAlgorithm } from '../../../../../src/filter/modifier/modify/split/SplitAlgorithm';

/**
 * Mock split algorithm for testing.
 * Splits text into chunks of a fixed character size.
 */
export class SplitAlgorithmMock extends SplitAlgorithm {
  private chunkSize: number;

  constructor(chunkSize: number) {
    super();
    this.chunkSize = chunkSize;
  }

  split(segment: string): string[] {
    const result: string[] = [];
    for (let i = 0; i < segment.length; i += this.chunkSize) {
      result.push(segment.substring(i, Math.min(i + this.chunkSize, segment.length)));
    }
    return result;
  }
}

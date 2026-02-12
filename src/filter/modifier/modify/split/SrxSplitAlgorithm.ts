import { SplitAlgorithm } from './SplitAlgorithm';

/**
 * SRX-based sentence splitting algorithm.
 * This requires the segment library which is not available in JS.
 * Throws an error if used — use SentenceSplitAlgorithm instead.
 */
export class SrxSplitAlgorithm extends SplitAlgorithm {
  constructor(_srxContent: string, _language: string) {
    super();
  }

  split(_segment: string): string[] {
    throw new Error(
      'SRX split algorithm is not implemented in the TypeScript version. ' +
        'Use split-sentence instead.'
    );
  }
}

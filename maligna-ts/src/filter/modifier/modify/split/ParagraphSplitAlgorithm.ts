import { SplitAlgorithm } from './SplitAlgorithm.js';

/**
 * Splits text by paragraphs (empty lines).
 */
export class ParagraphSplitAlgorithm extends SplitAlgorithm {
  split(str: string): string[] {
    // Split on double newlines (paragraph breaks)
    const paragraphs = str.split(/\n\s*\n/);
    return paragraphs.filter((p) => p.trim().length > 0);
  }
}

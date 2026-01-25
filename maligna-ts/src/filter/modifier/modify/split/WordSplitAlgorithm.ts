import { SplitAlgorithm } from './SplitAlgorithm.js';

/**
 * Checks if a character is a letter or digit (alphanumeric).
 */
function isLetterOrDigit(ch: string): boolean {
  return /^[\p{L}\p{N}]$/u.test(ch);
}

/**
 * Checks if a character is whitespace.
 */
function isWhitespace(ch: string): boolean {
  return /^\s$/.test(ch);
}

/**
 * Represents simple split algorithm separating input segment into words.
 * Word boundaries are assumed to be everything that is not a character or
 * digit. Whitespace characters are removed from the output.
 */
export class WordSplitAlgorithm extends SplitAlgorithm {
  split(str: string): string[] {
    const wordList: string[] = [];
    let start = 0;

    for (let end = 0; end < str.length; ++end) {
      const ch = str.charAt(end);
      if (!isLetterOrDigit(ch)) {
        if (end - start > 0) {
          const word = str.substring(start, end);
          wordList.push(word);
        }
        if (!isWhitespace(ch)) {
          const word = str.substring(end, end + 1);
          wordList.push(word);
        }
        start = end + 1;
      }
    }

    if (start < str.length) {
      const word = str.substring(start);
      wordList.push(word);
    }

    return wordList;
  }
}

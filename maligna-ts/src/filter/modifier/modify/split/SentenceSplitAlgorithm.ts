import { SplitAlgorithm } from './SplitAlgorithm.js';

/**
 * Simple splitter for sentence splitting.
 * Splits on end-of-line and after .?! if followed by capital letter.
 */
class SimpleSplitter {
  private readonly text: string;
  private position: number = 0;

  constructor(text: string) {
    this.text = text;
  }

  hasNext(): boolean {
    return this.position < this.text.length;
  }

  next(): string {
    const start = this.position;
    let inSentence = false;

    while (this.position < this.text.length) {
      const ch = this.text.charAt(this.position);
      this.position++;

      // Handle end of line
      if (ch === '\n' || ch === '\r') {
        if (this.position < this.text.length && this.text.charAt(this.position) === '\n') {
          this.position++;
        }
        return this.text.substring(start, this.position);
      }

      // Handle sentence-ending punctuation
      if (ch === '.' || ch === '?' || ch === '!') {
        inSentence = true;
        // Look ahead for capital letter after whitespace
        let lookAhead = this.position;
        while (lookAhead < this.text.length) {
          const nextCh = this.text.charAt(lookAhead);
          if (/^\s$/.test(nextCh)) {
            lookAhead++;
          } else if (/^[\p{Lu}]$/u.test(nextCh)) {
            // Capital letter found - end sentence here
            return this.text.substring(start, this.position);
          } else {
            // Not a capital letter - continue
            break;
          }
        }
      }
    }

    return this.text.substring(start, this.position);
  }
}

/**
 * Represents simple sentence splitter using hardcoded rules.
 *
 * Splitting does not omit any characters.
 *
 * For more accurate sentence segmentation, consider using more
 * sophisticated algorithms.
 */
export class SentenceSplitAlgorithm extends SplitAlgorithm {
  /**
   * Splits input segment to a list of sentences. Splitting occurs
   * after end-of-line character and after end of sentence character (.?!),
   * if the next character is capital letter.
   *
   * @param str input segment
   * @returns list of sentences
   */
  split(str: string): string[] {
    const segmentList: string[] = [];
    const splitter = new SimpleSplitter(str);

    while (splitter.hasNext()) {
      const segment = splitter.next();
      if (segment.length > 0) {
        segmentList.push(segment);
      }
    }

    return segmentList;
  }
}

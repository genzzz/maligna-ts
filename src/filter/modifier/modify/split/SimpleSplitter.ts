/**
 * Simple sentence splitter using a state machine.
 * Splits text after end-of-line character and after end of sentence
 * character (.?!) if the next characters are whitespace and a capital letter.
 * Faithfully reproduces the Java SimpleSplitter logic.
 */

enum SplitterState {
  READY,
  AFTER_BREAK,
  AFTER_SPACE,
}

export class SimpleSplitter {
  private breakCharacters: Set<string>;

  constructor(breakCharacters: string = '.?!') {
    this.breakCharacters = new Set(breakCharacters.split(''));
  }

  split(text: string): string[] {
    const result: string[] = [];
    let state = SplitterState.READY;
    // Buffer accumulates characters; leftCharacters tracks how many
    // trailing chars in the buffer belong to the NEXT segment.
    let buffer = '';
    let leftCharacters = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      buffer += ch;

      // Newline always terminates the current segment, regardless of state
      if (ch === '\n') {
        state = SplitterState.READY;
        leftCharacters = 0;
        // Emit segment (entire buffer, nothing left for next)
        result.push(buffer);
        buffer = '';
        continue;
      }

      if (state === SplitterState.READY) {
        if (this.breakCharacters.has(ch)) {
          state = SplitterState.AFTER_BREAK;
        }
      } else if (state === SplitterState.AFTER_BREAK) {
        if (this.isWhitespace(ch)) {
          ++leftCharacters;
          state = SplitterState.AFTER_SPACE;
        } else if (this.breakCharacters.has(ch)) {
          // Stay in AFTER_BREAK (e.g., "..." or ".!")
        } else {
          state = SplitterState.READY;
          leftCharacters = 0;
        }
      } else if (state === SplitterState.AFTER_SPACE) {
        if (this.isUpperCase(ch)) {
          state = SplitterState.READY;
          ++leftCharacters;
          // Split: emit segment without the trailing leftCharacters
          const segment = buffer.substring(0, buffer.length - leftCharacters);
          result.push(segment);
          buffer = buffer.substring(buffer.length - leftCharacters);
          leftCharacters = 0;
        } else if (this.breakCharacters.has(ch)) {
          state = SplitterState.AFTER_BREAK;
          ++leftCharacters;
          // Split: emit segment without the trailing leftCharacters
          const segment = buffer.substring(0, buffer.length - leftCharacters);
          result.push(segment);
          buffer = buffer.substring(buffer.length - leftCharacters);
          leftCharacters = 0;
        } else if (this.isWhitespace(ch)) {
          ++leftCharacters;
        } else {
          state = SplitterState.READY;
          leftCharacters = 0;
        }
      }
    }

    // Emit remaining buffer as the last segment
    // (may be empty string if text ended with \n, matching Java's EOF behavior)
    result.push(buffer);

    return result;
  }

  private isWhitespace(ch: string): boolean {
    return /\s/.test(ch);
  }

  private isUpperCase(ch: string): boolean {
    return /\p{Lu}/u.test(ch);
  }
}

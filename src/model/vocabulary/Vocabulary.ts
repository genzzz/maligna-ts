/**
 * Represents a vocabulary mapping words to identifiers.
 */
export class Vocabulary {
  static readonly NULL_WID = 0;
  static readonly NULL_WORD = '{NULL}';
  static readonly UNKNOWN_WID = 1;
  static readonly UNKNOWN_WORD = '{UNKNOWN}';

  private wordArray: string[] = [];
  private wordMap: Map<string, number> = new Map();

  constructor(wordCollection?: Iterable<string>) {
    // Add special null word
    this.putWord(Vocabulary.NULL_WORD);
    // Add unknown word
    this.putWord(Vocabulary.UNKNOWN_WORD);

    if (wordCollection) {
      for (const word of wordCollection) {
        this.putWord(word);
      }
    }
  }

  /**
   * Finds an identifier for a given word. Returns undefined if not found.
   */
  getWid(word: string): number | undefined {
    return this.wordMap.get(word);
  }

  /**
   * Gets wid, returning UNKNOWN_WID if not found.
   */
  getWidOrUnknown(word: string): number {
    return this.wordMap.get(word) ?? Vocabulary.UNKNOWN_WID;
  }

  /**
   * Gets word ids for a list of words.
   */
  getWidList(wordList: string[]): (number | undefined)[] {
    return wordList.map((word) => this.getWid(word));
  }

  /**
   * Checks if given word id is present in the vocabulary.
   */
  containsWid(wid: number): boolean {
    return wid >= 0 && wid < this.wordArray.length;
  }

  /**
   * Returns a word by given identifier. Returns undefined if not present.
   */
  getWord(wid: number): string | undefined {
    if (wid < this.wordArray.length) {
      return this.wordArray[wid];
    }
    return undefined;
  }

  /**
   * Checks if given word is present in the vocabulary.
   */
  containsWord(word: string): boolean {
    return this.wordMap.has(word);
  }

  /**
   * Adds a new word to the vocabulary if not present.
   * Returns the word id.
   */
  putWord(word: string): number {
    let wid = this.wordMap.get(word);
    if (wid === undefined) {
      wid = this.wordArray.length;
      this.wordArray.push(word);
      this.wordMap.set(word, wid);
    }
    return wid;
  }

  /**
   * Adds words from given list to the vocabulary.
   */
  putWordList(wordList: string[]): void {
    for (const word of wordList) {
      this.putWord(word);
    }
  }

  /**
   * Returns number of words in the vocabulary (excluding special words).
   */
  get wordCount(): number {
    return this.wordArray.length - 2; // Exclude NULL and UNKNOWN
  }

  /**
   * Returns total size including special words.
   */
  get size(): number {
    return this.wordArray.length;
  }
}

/**
 * Default tokenize algorithm - splits on whitespace.
 */
export function defaultTokenize(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }
  return trimmed.split(/\s+/);
}

/**
 * Tokenize a list of segments into word ids.
 */
export function tokenize(
  segments: readonly string[],
  vocabulary: Vocabulary,
  addToVocab: boolean = false
): number[] {
  const wids: number[] = [];
  for (const segment of segments) {
    const words = defaultTokenize(segment);
    for (const word of words) {
      if (addToVocab) {
        wids.push(vocabulary.putWord(word));
      } else {
        wids.push(vocabulary.getWidOrUnknown(word));
      }
    }
  }
  return wids;
}

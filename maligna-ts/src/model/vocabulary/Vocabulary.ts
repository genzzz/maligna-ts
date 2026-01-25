/**
 * Represents a vocabulary mapping words to identifiers.
 */
export class Vocabulary {
  public static readonly NULL_WID = 0;
  public static readonly NULL_WORD = '{NULL}';

  private readonly wordArray: string[] = [];
  private readonly wordMap: Map<string, number> = new Map();

  /**
   * Creates vocabulary containing just special null word NULL_WORD
   * with NULL_WID identifier.
   */
  constructor(wordCollection?: Iterable<string>) {
    this.putWord(Vocabulary.NULL_WORD);
    if (wordCollection) {
      for (const word of wordCollection) {
        this.putWord(word);
      }
    }
  }

  /**
   * Finds an identifier for a given word. If the word does not exist
   * in the vocabulary returns null.
   */
  getWid(word: string): number | null {
    const wid = this.wordMap.get(word);
    return wid !== undefined ? wid : null;
  }

  /**
   * Convenience method that retrieves all the words from the list using
   * getWid and returns a list of identifiers. If some
   * words cannot be found in the vocabulary then corresponding identifiers
   * on the resulting list will be null.
   */
  getWidList(wordList: readonly string[]): (number | null)[] {
    return wordList.map((word) => this.getWid(word));
  }

  /**
   * Checks if given word id is present in the vocabulary.
   */
  containsWid(wid: number): boolean {
    return wid >= 0 && wid < this.wordArray.length;
  }

  /**
   * Checks if given word is present in the vocabulary.
   */
  containsWord(word: string): boolean {
    return this.wordMap.has(word);
  }

  /**
   * Returns a word by given identifier. If the word is not present in the
   * vocabulary returns null.
   */
  getWord(wid: number): string | null {
    if (wid < this.wordArray.length) {
      return this.wordArray[wid] ?? null;
    }
    return null;
  }

  /**
   * Inserts word into vocabulary and returns its identifier.
   * If the word already exists returns existing identifier.
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
   * Inserts all words from list into vocabulary.
   */
  putWordList(wordList: readonly string[]): void {
    for (const word of wordList) {
      this.putWord(word);
    }
  }

  /**
   * @returns number of words in vocabulary
   */
  getWordCount(): number {
    return this.wordArray.length;
  }
}

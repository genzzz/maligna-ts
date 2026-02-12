/**
 * Bidirectional mapping between words and word IDs.
 */
export class Vocabulary {
  public static readonly NULL_WID = 0;
  public static readonly NULL_WORD = '{NULL}';

  private wordToWid: Map<string, number> = new Map();
  private widToWord: Map<number, string> = new Map();
  private nextWid: number = 1;

  constructor() {
    this.wordToWid.set(Vocabulary.NULL_WORD, Vocabulary.NULL_WID);
    this.widToWord.set(Vocabulary.NULL_WID, Vocabulary.NULL_WORD);
  }

  /**
   * Adds a word to the vocabulary if not present. Returns the word's ID.
   */
  putWord(word: string): number {
    const existing = this.wordToWid.get(word);
    if (existing !== undefined) {
      return existing;
    }
    const wid = this.nextWid++;
    this.wordToWid.set(word, wid);
    this.widToWord.set(wid, word);
    return wid;
  }

  /**
   * Adds a list of words to the vocabulary.
   */
  putWordList(wordList: string[]): void {
    for (const word of wordList) {
      this.putWord(word);
    }
  }

  /**
   * Gets the word ID for a word. Returns NULL_WID if not present.
   */
  getWid(word: string): number {
    const wid = this.wordToWid.get(word);
    return wid !== undefined ? wid : Vocabulary.NULL_WID;
  }

  /**
   * Gets the word for a word ID.
   */
  getWord(wid: number): string {
    const word = this.widToWord.get(wid);
    return word !== undefined ? word : Vocabulary.NULL_WORD;
  }

  /**
   * Gets word IDs for a list of words.
   */
  getWidList(wordList: string[]): number[] {
    return wordList.map((w) => this.getWid(w));
  }

  /**
   * Returns the number of words in the vocabulary (including NULL).
   */
  size(): number {
    return this.wordToWid.size;
  }

  /**
   * Returns all word IDs.
   */
  getAllWids(): number[] {
    return [...this.widToWord.keys()];
  }

  /**
   * Returns whether the vocabulary contains the given word.
   */
  containsWord(word: string): boolean {
    return this.wordToWid.has(word);
  }
}

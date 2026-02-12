/**
 * Language model interface — stores word probabilities.
 */
export interface LanguageModel {
  getWordProbability(wid: number): number;
  getSingletonWordProbability(): number;
}

/**
 * Mutable language model that accumulates word counts and normalizes to probabilities.
 */
export class MutableLanguageModel implements LanguageModel {
  private wordCountMap: Map<number, number> = new Map();
  private totalCount: number = 0;
  private wordProbabilityMap: Map<number, number> = new Map();
  private singletonWordProbability: number = 0;

  addWord(wid: number): void {
    this.addWordOccurrence(wid, 1);
  }

  addWordOccurrence(wid: number, count: number): void {
    this.wordCountMap.set(wid, (this.wordCountMap.get(wid) || 0) + count);
    this.totalCount += count;
  }

  normalize(): void {
    this.wordProbabilityMap.clear();
    if (this.totalCount > 0) {
      for (const [wid, count] of this.wordCountMap.entries()) {
        this.wordProbabilityMap.set(wid, Math.fround(count / this.totalCount));
      }
      this.singletonWordProbability = Math.fround(1 / this.totalCount);
    }
  }

  getWordProbability(wid: number): number {
    const prob = this.wordProbabilityMap.get(wid);
    return prob !== undefined ? prob : 0;
  }

  getSingletonWordProbability(): number {
    return this.singletonWordProbability;
  }
}

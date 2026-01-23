/**
 * Represents simple unigram language model.
 * Responsible for storing word probabilities in given language.
 */
export interface LanguageModel {
  /**
   * Returns word occurrence probability in modeled language.
   */
  getWordProbability(wid: number): number;

  /**
   * Returns probability of some word if it occurred only once.
   */
  readonly singletonWordProbability: number;
}

/**
 * Mutable implementation of LanguageModel for training.
 */
class MutableLanguageModel implements LanguageModel {
  private readonly wordCounts: Map<number, number> = new Map();
  private totalCount: number = 0;

  addWord(wid: number): void {
    const count = this.wordCounts.get(wid) || 0;
    this.wordCounts.set(wid, count + 1);
    this.totalCount++;
  }

  getWordProbability(wid: number): number {
    const count = this.wordCounts.get(wid) || 0;
    if (count === 0) {
      return this.singletonWordProbability;
    }
    return count / this.totalCount;
  }

  get singletonWordProbability(): number {
    if (this.totalCount === 0) return 1;
    return 1 / this.totalCount;
  }
}

/**
 * Train a language model from a list of word ids.
 */
export function trainLanguageModel(widList: number[]): LanguageModel {
  const model = new MutableLanguageModel();
  for (const wid of widList) {
    model.addWord(wid);
  }
  return model;
}

/**
 * Train language model from multiple sentences (each sentence is a list of wids).
 */
export function trainLanguageModelFromSentences(
  sentences: number[][]
): LanguageModel {
  const model = new MutableLanguageModel();
  for (const sentence of sentences) {
    for (const wid of sentence) {
      model.addWord(wid);
    }
  }
  return model;
}

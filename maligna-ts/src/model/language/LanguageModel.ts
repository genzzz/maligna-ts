/**
 * Represents simple unigram language model. Responsible for storing
 * word probabilities in given language. Words are represented as
 * integer word IDs.
 */
export interface LanguageModel {
  /**
   * Returns word occurrence probability in modeled language.
   * @param wid word id
   * @returns word occurrence probability; [0, 1]
   */
  getWordProbability(wid: number): number;

  /**
   * Returns probability of some word if it occurred only once in
   * training corpus. Basically this number is equal to
   * 1 / total word number of words in the training corpus.
   */
  getSingletonWordProbability(): number;
}

/**
 * Represents language model that can be modified after it was created.
 * After the model has been populated, normalize() method must
 * be called to calculate the probabilities.
 */
export class MutableLanguageModel implements LanguageModel {
  private wordProbabilityArray: number[] = [];
  private wordOccurrenceCount: number = 0;
  private _singletonWordProbability: number = 0;

  getWordProbability(wid: number): number {
    if (wid >= 0 && wid < this.wordProbabilityArray.length) {
      return this.wordProbabilityArray[wid] ?? this._singletonWordProbability;
    }
    return this._singletonWordProbability;
  }

  getSingletonWordProbability(): number {
    return this._singletonWordProbability;
  }

  /**
   * Adds word occurrence to the model. Word is represented as numeric word id.
   */
  addWordOccurrence(wid: number, count: number = 1): void {
    if (wid < 0) {
      throw new Error('Word id must be >= 0');
    }
    this.ensureSize(wid + 1);
    this.wordProbabilityArray[wid] =
      (this.wordProbabilityArray[wid] ?? 0) + count;
    this.wordOccurrenceCount += count;
  }

  /**
   * Calculates the occurrence probabilities. This method should be called
   * after model has been populated.
   */
  normalize(): void {
    for (let i = 0; i < this.wordProbabilityArray.length; ++i) {
      const count = this.wordProbabilityArray[i] ?? 0;
      this.wordProbabilityArray[i] = count / this.wordOccurrenceCount;
    }
    this._singletonWordProbability = 1.0 / this.wordOccurrenceCount;
  }

  /**
   * Ensures that word probability array has given size by expanding
   * it with zeros if required.
   */
  private ensureSize(size: number): void {
    while (this.wordProbabilityArray.length < size) {
      this.wordProbabilityArray.push(0);
    }
  }
}

/**
 * Trains language model by adding all words from given segment list
 * (training corpus) to it and after that calculating the probabilities
 * by calling normalize().
 */
export function trainLanguageModel(
  segmentList: readonly (readonly number[])[]
): LanguageModel {
  const model = new MutableLanguageModel();

  for (const segment of segmentList) {
    for (const wid of segment) {
      model.addWordOccurrence(wid);
    }
  }
  model.normalize();

  return model;
}

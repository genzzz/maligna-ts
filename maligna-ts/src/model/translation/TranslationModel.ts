/**
 * Represents target word translation data - word id and probability.
 */
export interface TargetData {
  readonly wid: number;
  readonly probability: number;
}

/**
 * Represents source word translations with probabilities.
 */
export interface SourceData {
  /**
   * Returns probability of translating this source word to a target
   * word with given id.
   */
  getTranslationProbability(targetWid: number): number;

  /**
   * Returns list of translations with probability greater than
   * zero, sorted by probability descending.
   */
  getTranslationList(): TargetData[];
}

/**
 * Represents translation model which is basically probabilistic dictionary
 * - it stores source word translations to target words along with each
 * translation probability.
 */
export interface TranslationModel {
  /**
   * Retrieves translation data including translation probabilities to other
   * words for a word with given id
   */
  get(sourceWid: number): SourceData;
}

/**
 * Empty source data - returns uniform probability for all words.
 */
class EmptySourceData implements SourceData {
  private readonly uniformProbability: number;

  constructor(targetVocabularySize: number) {
    this.uniformProbability = 1.0 / targetVocabularySize;
  }

  getTranslationProbability(_targetWid: number): number {
    return this.uniformProbability;
  }

  getTranslationList(): TargetData[] {
    return [];
  }
}

/**
 * Initial source data - returns uniform probability for all words.
 */
class InitialSourceData implements SourceData {
  private readonly uniformProbability: number;

  constructor(targetVocabularySize: number) {
    this.uniformProbability = 1.0 / targetVocabularySize;
  }

  getTranslationProbability(_targetWid: number): number {
    return this.uniformProbability;
  }

  getTranslationList(): TargetData[] {
    return [];
  }
}

/**
 * Initial translation model - returns uniform probabilities.
 */
export class InitialTranslationModel implements TranslationModel {
  private readonly sourceData: InitialSourceData;

  constructor(targetVocabularySize: number = 1) {
    this.sourceData = new InitialSourceData(targetVocabularySize);
  }

  get(_sourceWid: number): SourceData {
    return this.sourceData;
  }
}

/**
 * Mutable source data for training.
 */
export class MutableSourceData implements SourceData {
  private readonly translationMap: Map<number, number> = new Map();
  private translationList: TargetData[] | null = null;

  getTranslationProbability(targetWid: number): number {
    return this.translationMap.get(targetWid) ?? 0;
  }

  setTranslationProbability(targetWid: number, probability: number): void {
    this.translationMap.set(targetWid, probability);
    this.translationList = null; // Invalidate cache
  }

  getTranslationList(): TargetData[] {
    if (this.translationList === null) {
      this.translationList = Array.from(this.translationMap.entries())
        .map(([wid, probability]) => ({ wid, probability }))
        .filter((td) => td.probability > 0)
        .sort((a, b) => b.probability - a.probability);
    }
    return this.translationList;
  }

  /**
   * Normalizes probabilities so they sum to 1.
   */
  normalize(): void {
    let sum = 0;
    for (const prob of this.translationMap.values()) {
      sum += prob;
    }
    if (sum > 0) {
      for (const [wid, prob] of this.translationMap.entries()) {
        this.translationMap.set(wid, prob / sum);
      }
    }
    this.translationList = null;
  }
}

/**
 * Mutable translation model for training.
 */
export class MutableTranslationModel implements TranslationModel {
  private readonly sourceDataMap: Map<number, MutableSourceData> = new Map();
  private readonly emptySourceData: EmptySourceData;

  constructor(targetVocabularySize: number = 1) {
    this.emptySourceData = new EmptySourceData(targetVocabularySize);
  }

  get(sourceWid: number): SourceData {
    return this.sourceDataMap.get(sourceWid) ?? this.emptySourceData;
  }

  getMutable(sourceWid: number): MutableSourceData {
    let sourceData = this.sourceDataMap.get(sourceWid);
    if (!sourceData) {
      sourceData = new MutableSourceData();
      this.sourceDataMap.set(sourceWid, sourceData);
    }
    return sourceData;
  }

  /**
   * Normalizes all source data.
   */
  normalize(): void {
    for (const sourceData of this.sourceDataMap.values()) {
      sourceData.normalize();
    }
  }

  /**
   * Sorts all translation lists by probability.
   */
  sort(): void {
    for (const sourceData of this.sourceDataMap.values()) {
      sourceData.getTranslationList(); // Force sorting
    }
  }
}

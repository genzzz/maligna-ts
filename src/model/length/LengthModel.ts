/**
 * Represents a model of segment (sentence, paragraph) lengths for a particular
 * language, allowing to calculate given length probability and averages.
 */
export interface LengthModel {
  /**
   * Calculates probability that segment of given length will occur
   * in modeled language.
   */
  getLengthProbability(length: number): number;

  /**
   * Mean segment length in modeled language.
   */
  readonly meanLength: number;

  /**
   * Probability of a length that occurred only once in training corpus.
   */
  readonly singletonLengthProbability: number;
}

/**
 * Mutable implementation of LengthModel for training.
 */
class MutableLengthModel implements LengthModel {
  private readonly lengthCounts: Map<number, number> = new Map();
  private totalCount: number = 0;
  private totalLength: number = 0;

  addLength(length: number): void {
    const count = this.lengthCounts.get(length) || 0;
    this.lengthCounts.set(length, count + 1);
    this.totalCount++;
    this.totalLength += length;
  }

  getLengthProbability(length: number): number {
    const count = this.lengthCounts.get(length) || 0;
    if (count === 0) {
      return this.singletonLengthProbability;
    }
    return count / this.totalCount;
  }

  get meanLength(): number {
    if (this.totalCount === 0) return 1;
    return this.totalLength / this.totalCount;
  }

  get singletonLengthProbability(): number {
    if (this.totalCount === 0) return 1;
    return 1 / this.totalCount;
  }
}

/**
 * Train a length model from a list of segment lengths.
 */
export function trainLengthModel(lengthList: number[]): LengthModel {
  const model = new MutableLengthModel();
  for (const length of lengthList) {
    model.addLength(length);
  }
  return model;
}

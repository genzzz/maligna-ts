/**
 * Represents a model of segment (sentence, paragraph) lengths for a particular
 * language, allowing to calculate given length probability and averages.
 */
export interface LengthModel {
  /**
   * Calculates probability that segment of given length will occur
   * in modeled language.
   * @param length segment length
   * @returns length probability
   */
  getLengthProbability(length: number): number;

  /**
   * @returns mean segment length in modeled language
   */
  readonly meanLength: number;
}

/**
 * Mutable length model that can be modified after creation.
 * After the model has been populated, normalize() must be called
 * to calculate the probabilities.
 */
export class MutableLengthModel implements LengthModel {
  private lengthProbabilityArray: number[] = [];
  private _meanLength: number = 0;
  private totalLength: number = 0;
  private lengthOccurrenceCount: number = 0;

  get meanLength(): number {
    return this._meanLength;
  }

  getLengthProbability(length: number): number {
    if (length >= 0 && length < this.lengthProbabilityArray.length) {
      return this.lengthProbabilityArray[length] ?? 0;
    }
    return 0;
  }

  /**
   * Adds occurrence of segment length to the model.
   */
  addLengthOccurrence(length: number): void {
    if (length < 0) {
      throw new Error('Length must be >= 0');
    }
    this.ensureSize(length + 1);
    this.lengthProbabilityArray[length] =
      (this.lengthProbabilityArray[length] ?? 0) + 1;
    ++this.lengthOccurrenceCount;
    this.totalLength += length;
  }

  /**
   * Calculates the occurrence probabilities. This method should be called
   * after model has been populated.
   */
  normalize(): void {
    for (let i = 0; i < this.lengthProbabilityArray.length; ++i) {
      const count = this.lengthProbabilityArray[i] ?? 0;
      this.lengthProbabilityArray[i] = count / this.lengthOccurrenceCount;
    }
    this._meanLength = this.totalLength / this.lengthOccurrenceCount;
  }

  /**
   * Ensures that length probability array has given size by expanding
   * it with zeros if required.
   */
  private ensureSize(size: number): void {
    while (this.lengthProbabilityArray.length < size) {
      this.lengthProbabilityArray.push(0);
    }
  }
}

/**
 * Trains a length model using given segment lengths.
 * @param segmentLengthList segment length list
 * @returns created length model reflecting segment length occurrence probabilities
 */
export function trainLengthModel(segmentLengthList: readonly number[]): LengthModel {
  const model = new MutableLengthModel();

  for (const segmentLength of segmentLengthList) {
    model.addLengthOccurrence(segmentLength);
  }
  model.normalize();

  return model;
}

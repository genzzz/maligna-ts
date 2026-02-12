/**
 * Length model interface — stores length probabilities.
 */
export interface LengthModel {
  getLengthProbability(length: number): number;
  getMeanLength(): number;
}

/**
 * Mutable length model that accumulates length counts and normalizes.
 */
export class MutableLengthModel implements LengthModel {
  private lengthCountMap: Map<number, number> = new Map();
  private totalCount: number = 0;
  private totalLength: number = 0;
  private lengthProbabilityMap: Map<number, number> = new Map();
  private meanLength: number = 0;

  addLength(length: number): void {
    this.lengthCountMap.set(length, (this.lengthCountMap.get(length) || 0) + 1);
    this.totalCount++;
    this.totalLength += length;
  }

  normalize(): void {
    this.lengthProbabilityMap.clear();
    if (this.totalCount > 0) {
      for (const [length, count] of this.lengthCountMap.entries()) {
        // Java: float probability = ... / (float)lengthOccurenceCount
        this.lengthProbabilityMap.set(length, Math.fround(count / this.totalCount));
      }
      // Java: meanLength = (float)totalLength / (float)lengthOccurenceCount
      this.meanLength = Math.fround(this.totalLength / this.totalCount);
    }
  }

  getLengthProbability(length: number): number {
    const prob = this.lengthProbabilityMap.get(length);
    return prob !== undefined ? prob : 0;
  }

  getMeanLength(): number {
    return this.meanLength;
  }
}

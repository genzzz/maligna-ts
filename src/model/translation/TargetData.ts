/**
 * Single source-to-target word translation data.
 */
export class TargetData {
  public readonly wid: number;
  public readonly probability: number;

  constructor(wid: number, probability: number) {
    this.wid = wid;
    this.probability = probability;
  }
}

/**
 * Compare TargetData by probability descending.
 */
export function compareTargetDataByProbability(a: TargetData, b: TargetData): number {
  return b.probability - a.probability;
}

/**
 * Calculator interface for computing alignment scores.
 * Score = -ln(probability), so lower scores mean higher probability.
 */
export interface Calculator {
  calculateScore(sourceSegmentList: string[], targetSegmentList: string[]): number;
}

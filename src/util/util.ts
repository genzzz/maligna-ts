/**
 * Converts probability to score (-ln(probability)).
 * Score is used internally as it's more numerically stable.
 */
export function toScore(probability: number): number {
  return -Math.log(probability);
}

/**
 * Converts score back to probability (e^(-score)).
 */
export function toProbability(score: number): number {
  return Math.exp(-score);
}

/**
 * Adds scores in log domain: -ln(e^(-a) + e^(-b)).
 * Used when we need to sum probabilities but work in score space.
 */
export function scoreSum(scoreList: number[]): number {
  if (scoreList.length === 0) {
    return Infinity;
  }

  // Find minimum score (maximum probability) for numerical stability
  let minScore = Infinity;
  for (const score of scoreList) {
    if (score < minScore) {
      minScore = score;
    }
  }

  if (minScore === Infinity) {
    return Infinity;
  }

  let sum = 0;
  for (const score of scoreList) {
    sum += Math.exp(minScore - score);
  }

  return minScore - Math.log(sum);
}

/**
 * Merge multiple string lists into a single list.
 */
export function merge(segmentLists: string[][]): string[] {
  const result: string[] = [];
  for (const list of segmentLists) {
    result.push(...list);
  }
  return result;
}

/**
 * Round a number to the given number of decimal places.
 */
export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Converts probability to score. The score is more accurate for calculations.
 * score = -ln(probability)
 */
export function toScore(probability: number): number {
  return -Math.log(probability);
}

/**
 * Converts score to probability.
 * probability = e^(-score)
 */
export function toProbability(score: number): number {
  return Math.exp(-score);
}

/**
 * Calculates a sum of probabilities. The probabilities are given as scores
 * and the result is returned as score as well. Takes care to preserve maximum precision.
 */
export function scoreSum(scoreList: number[]): number {
  if (scoreList.length === 0) {
    return 0.0;
  }

  const minScore = Math.min(...scoreList);
  if (minScore === Infinity) {
    return Infinity;
  }

  let probabilitySum = 0.0;
  for (const score of scoreList) {
    const probability = toProbability(score - minScore);
    probabilitySum += probability;
  }
  const probabilityScore = toScore(probabilitySum);
  return minScore + probabilityScore;
}

/**
 * Rounds a given number to a given precision places after decimal point.
 */
export function round(number: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

/**
 * Calculates value of a Poisson distribution function at given point (x).
 * Returns -ln(probability).
 */
export function poissonDistribution(mean: number, x: number): number {
  if (mean <= 0) {
    throw new Error('Mean must be positive');
  }
  return mean + -x * Math.log(mean) + logFactorial(x);
}

/**
 * Returns logarithm from factorial of a given number ln(x!).
 */
export function logFactorial(x: number): number {
  if (x < 0) {
    throw new Error(`Cannot calculate factorial for a negative number: ${x}`);
  }
  let y = 0;
  for (let i = 2; i <= x; i++) {
    y += Math.log(i);
  }
  return y;
}

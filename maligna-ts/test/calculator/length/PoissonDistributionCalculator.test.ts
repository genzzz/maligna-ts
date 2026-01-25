import {
  poissonDistribution,
  factorial,
} from '../../../src/calculator/length/PoissonDistributionCalculator';

/**
 * Represents PoissonDistributionCalculator unit test.
 */
describe('PoissonDistributionCalculator', () => {
  /**
   * Tests factorial calculation.
   */
  test('testFactorial', () => {
    expect(Math.exp(factorial(1))).toBeCloseTo(1.0, 2);
    expect(Math.exp(factorial(2))).toBeCloseTo(2.0, 2);
    expect(Math.exp(factorial(3))).toBeCloseTo(6.0, 2);
    expect(Math.exp(factorial(4))).toBeCloseTo(24.0, 2);
  });

  /**
   * Tests Poisson distribution points calculation using some manually
   * calculated values.
   */
  test('testPoissonDistribution', () => {
    expect(Math.exp(-poissonDistribution(0.5, 0))).toBeCloseTo(0.6065, 3);
    expect(Math.exp(-poissonDistribution(1.0, 0))).toBeCloseTo(0.3679, 3);
    expect(Math.exp(-poissonDistribution(1.0, 1))).toBeCloseTo(0.3679, 3);
    expect(Math.exp(-poissonDistribution(1.0, 2))).toBeCloseTo(0.1839, 3);
    expect(Math.exp(-poissonDistribution(2.0, 1))).toBeCloseTo(0.2707, 3);
    expect(Math.exp(-poissonDistribution(2.0, 3))).toBeCloseTo(0.1805, 3);
  });
});

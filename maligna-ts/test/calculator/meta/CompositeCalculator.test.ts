import { CompositeCalculator } from '../../../src/calculator/meta/CompositeCalculator';
import { Calculator } from '../../../src/calculator/Calculator';
import { CalculatorMock } from '../CalculatorMock';

/**
 * Represents unit test of CompositeCalculator.
 */
describe('CompositeCalculator', () => {
  /**
   * Checks using CalculatorMock that composite really returns
   * the sum of scores of all contained calculators.
   */
  test('calculate', () => {
    const calculatorList: Calculator[] = [
      new CalculatorMock(0.5),
      new CalculatorMock(0.25),
    ];
    const calculator = new CompositeCalculator(calculatorList);
    expect(calculator.calculateScore([], [])).toBeCloseTo(0.75, 5);
  });
});

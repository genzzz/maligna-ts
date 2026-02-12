import { describe, test, expect } from 'vitest';
import { CompositeCalculator } from '../../../src/calculator/meta';
import { CalculatorMock } from '../../../src/calculator/CalculatorMock';

describe('CompositeCalculatorTest', () => {
  test('calculate', () => {
    const calculatorList = [
      new CalculatorMock(0.5),
      new CalculatorMock(0.25)
    ];
    const calculator = new CompositeCalculator(calculatorList);
    expect(calculator.calculateScore([], [])).toBeCloseTo(0.75, 2);
  });
});

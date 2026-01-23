import { Calculator } from '../../../src/calculator/Calculator';
import { CompositeCalculator, MinimumCalculator } from '../../../src/calculator/meta/CompositeCalculator';

// Mock calculator for testing
class MockCalculator implements Calculator {
  constructor(private readonly returnScore: number) {}

  calculateScore(): number {
    return this.returnScore;
  }
}

describe('CompositeCalculator', () => {
  it('should sum scores from all calculators', () => {
    const calc1 = new MockCalculator(1.0);
    const calc2 = new MockCalculator(2.0);
    const calc3 = new MockCalculator(3.0);

    const composite = new CompositeCalculator([calc1, calc2, calc3]);
    const score = composite.calculateScore(['source'], ['target']);

    expect(score).toBe(6.0);
  });

  it('should return 0 for empty calculator list', () => {
    const composite = new CompositeCalculator([]);
    const score = composite.calculateScore(['source'], ['target']);
    expect(score).toBe(0);
  });

  it('should work with single calculator', () => {
    const calc = new MockCalculator(5.0);
    const composite = new CompositeCalculator([calc]);
    const score = composite.calculateScore(['source'], ['target']);
    expect(score).toBe(5.0);
  });

  it('should handle zero scores', () => {
    const calc1 = new MockCalculator(0);
    const calc2 = new MockCalculator(3.0);
    const composite = new CompositeCalculator([calc1, calc2]);
    const score = composite.calculateScore(['source'], ['target']);
    expect(score).toBe(3.0);
  });

  it('should not modify original calculator array', () => {
    const calculators = [new MockCalculator(1.0)];
    const composite = new CompositeCalculator(calculators);
    calculators.push(new MockCalculator(2.0));
    
    const score = composite.calculateScore(['source'], ['target']);
    expect(score).toBe(1.0);
  });
});

describe('MinimumCalculator', () => {
  it('should return minimum score from all calculators', () => {
    const calc1 = new MockCalculator(5.0);
    const calc2 = new MockCalculator(2.0);
    const calc3 = new MockCalculator(8.0);

    const minimum = new MinimumCalculator([calc1, calc2, calc3]);
    const score = minimum.calculateScore(['source'], ['target']);

    expect(score).toBe(2.0);
  });

  it('should return Infinity for empty calculator list', () => {
    const minimum = new MinimumCalculator([]);
    const score = minimum.calculateScore(['source'], ['target']);
    expect(score).toBe(Infinity);
  });

  it('should work with single calculator', () => {
    const calc = new MockCalculator(5.0);
    const minimum = new MinimumCalculator([calc]);
    const score = minimum.calculateScore(['source'], ['target']);
    expect(score).toBe(5.0);
  });

  it('should handle zero scores', () => {
    const calc1 = new MockCalculator(0);
    const calc2 = new MockCalculator(3.0);
    const minimum = new MinimumCalculator([calc1, calc2]);
    const score = minimum.calculateScore(['source'], ['target']);
    expect(score).toBe(0);
  });

  it('should handle equal scores', () => {
    const calc1 = new MockCalculator(3.0);
    const calc2 = new MockCalculator(3.0);
    const minimum = new MinimumCalculator([calc1, calc2]);
    const score = minimum.calculateScore(['source'], ['target']);
    expect(score).toBe(3.0);
  });

  it('should not modify original calculator array', () => {
    const calculators = [new MockCalculator(5.0)];
    const minimum = new MinimumCalculator(calculators);
    calculators.push(new MockCalculator(1.0));
    
    const score = minimum.calculateScore(['source'], ['target']);
    expect(score).toBe(5.0);
  });
});

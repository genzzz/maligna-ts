import { Alignment } from '../../../src/core/Alignment';
import { CharCounter, SplitCounter } from '../../../src/calculator/length/Counter';
import { PoissonDistributionCalculator } from '../../../src/calculator/length/PoissonDistributionCalculator';

describe('PoissonDistributionCalculator', () => {
  // Create sample training data
  const trainingAlignments = [
    new Alignment(['Hello world'], ['Bonjour monde']),
    new Alignment(['Good morning'], ['Bon matin']),
    new Alignment(['How are you today'], ['Comment allez vous aujourd hui']),
    new Alignment(['Nice weather'], ['Beau temps']),
    new Alignment(['Thank you very much'], ['Merci beaucoup']),
  ];

  describe('with CharCounter', () => {
    const counter = new CharCounter();
    const calculator = new PoissonDistributionCalculator(counter, trainingAlignments);

    it('should return 0 for empty alignment', () => {
      const score = calculator.calculateScore([], []);
      expect(score).toBe(0);
    });

    it('should return positive score for non-empty alignment', () => {
      const score = calculator.calculateScore(['Hello'], ['Bonjour']);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should return score for source-only alignment', () => {
      const score = calculator.calculateScore(['Hello'], []);
      expect(score).toBeGreaterThan(0);
    });

    it('should return score for target-only alignment', () => {
      const score = calculator.calculateScore([], ['Bonjour']);
      expect(score).toBeGreaterThan(0);
    });

    it('should return lower score for similar length ratio', () => {
      // Similar to training data ratio
      const goodScore = calculator.calculateScore(['Hello world'], ['Bonjour monde']);
      // Very different ratio
      const badScore = calculator.calculateScore(['Hi'], ['This is a very long translation']);
      expect(goodScore).toBeLessThan(badScore);
    });

    it('should handle multiple segments', () => {
      const score = calculator.calculateScore(
        ['Hello', 'World'],
        ['Bonjour', 'Monde']
      );
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('with SplitCounter', () => {
    const counter = new SplitCounter();
    const calculator = new PoissonDistributionCalculator(counter, trainingAlignments);

    it('should calculate score based on word count', () => {
      const score = calculator.calculateScore(['Hello world'], ['Bonjour monde']);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should give lower score for balanced word counts', () => {
      const balanced = calculator.calculateScore(['one two three'], ['un deux trois']);
      const unbalanced = calculator.calculateScore(['one'], ['un deux trois quatre cinq']);
      expect(balanced).toBeLessThan(unbalanced);
    });
  });

  describe('edge cases', () => {
    it('should handle training with single alignment', () => {
      const single = [new Alignment(['Test'], ['Test'])];
      const counter = new CharCounter();
      const calculator = new PoissonDistributionCalculator(counter, single);
      const score = calculator.calculateScore(['Hello'], ['World']);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty segments', () => {
      const counter = new CharCounter();
      const calculator = new PoissonDistributionCalculator(counter, trainingAlignments);
      // Empty segments lead to zero mean which throws
      expect(() => calculator.calculateScore([''], [''])).toThrow('Mean must be positive');
    });
  });
});

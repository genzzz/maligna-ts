import { Alignment } from '../../../src/core/Alignment';
import { CharCounter, SplitCounter } from '../../../src/calculator/length/Counter';
import { NormalDistributionCalculator } from '../../../src/calculator/length/NormalDistributionCalculator';

describe('NormalDistributionCalculator', () => {
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
    const calculator = new NormalDistributionCalculator(counter, trainingAlignments);

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
      // This should use the language model score
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should return score for target-only alignment', () => {
      const score = calculator.calculateScore([], ['Bonjour']);
      expect(score).toBeGreaterThan(0);
    });

    it('should give lower score for expected length ratio', () => {
      // Similar length ratio to training data
      const goodScore = calculator.calculateScore(['Hello world'], ['Bonjour monde']);
      // Very different ratio - short source, long target
      const badScore = calculator.calculateScore(['Hi'], ['This is a very long translation indeed']);
      expect(goodScore).toBeLessThan(badScore);
    });

    it('should handle multiple source segments', () => {
      const score = calculator.calculateScore(
        ['Hello', 'World'],
        ['Bonjour Monde']
      );
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple target segments', () => {
      const score = calculator.calculateScore(
        ['Hello World'],
        ['Bonjour', 'Monde']
      );
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('with SplitCounter (word-based)', () => {
    const counter = new SplitCounter();
    const calculator = new NormalDistributionCalculator(counter, trainingAlignments);

    it('should calculate score based on word count', () => {
      const score = calculator.calculateScore(['Hello world'], ['Bonjour monde']);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should penalize large deviations from expected', () => {
      const normal = calculator.calculateScore(
        ['one two three'],
        ['un deux trois']
      );
      const deviation = calculator.calculateScore(
        ['one'],
        ['un deux trois quatre cinq six sept']
      );
      expect(deviation).toBeGreaterThan(normal);
    });
  });

  describe('edge cases', () => {
    it('should handle single training alignment', () => {
      const single = [new Alignment(['Test sentence'], ['Phrase de test'])];
      const counter = new CharCounter();
      const calculator = new NormalDistributionCalculator(counter, single);
      const score = calculator.calculateScore(['Hello'], ['Bonjour']);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty string segments', () => {
      const counter = new CharCounter();
      const calculator = new NormalDistributionCalculator(counter, trainingAlignments);
      const score = calculator.calculateScore([''], ['']);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle long segments', () => {
      const counter = new CharCounter();
      const calculator = new NormalDistributionCalculator(counter, trainingAlignments);
      const longSource = 'This is a very long source segment that contains many words and characters.';
      const longTarget = 'Ceci est un très long segment cible qui contient beaucoup de mots et de caractères.';
      const score = calculator.calculateScore([longSource], [longTarget]);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});

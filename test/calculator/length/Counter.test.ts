import { CharCounter, SplitCounter } from '../../../src/calculator/length/Counter';

describe('CharCounter', () => {
  const counter = new CharCounter();

  describe('count', () => {
    it('should count characters in a string', () => {
      expect(counter.count('hello')).toBe(5);
    });

    it('should return 0 for empty string', () => {
      expect(counter.count('')).toBe(0);
    });

    it('should count spaces', () => {
      expect(counter.count('hello world')).toBe(11);
    });

    it('should count special characters', () => {
      expect(counter.count('!@#$%')).toBe(5);
    });

    it('should handle unicode characters', () => {
      expect(counter.count('café')).toBe(4);
    });

    it('should count newlines and tabs', () => {
      expect(counter.count('a\nb\tc')).toBe(5);
    });
  });
});

describe('SplitCounter', () => {
  describe('with default pattern (whitespace)', () => {
    const counter = new SplitCounter();

    it('should count words in a string', () => {
      expect(counter.count('hello world')).toBe(2);
    });

    it('should return 0 for empty string', () => {
      expect(counter.count('')).toBe(0);
    });

    it('should return 0 for whitespace-only string', () => {
      expect(counter.count('   ')).toBe(0);
      expect(counter.count('\t\n')).toBe(0);
    });

    it('should count single word', () => {
      expect(counter.count('hello')).toBe(1);
    });

    it('should handle multiple spaces between words', () => {
      expect(counter.count('hello    world')).toBe(2);
    });

    it('should handle leading and trailing spaces', () => {
      expect(counter.count('  hello world  ')).toBe(2);
    });

    it('should split on tabs and newlines', () => {
      expect(counter.count('hello\tworld\nnew')).toBe(3);
    });

    it('should count words in a sentence', () => {
      expect(counter.count('The quick brown fox jumps.')).toBe(5);
    });
  });

  describe('with custom pattern', () => {
    it('should split on custom delimiter', () => {
      const counter = new SplitCounter(/,/);
      expect(counter.count('a,b,c')).toBe(3);
    });

    it('should split on hyphen', () => {
      const counter = new SplitCounter(/-/);
      expect(counter.count('state-of-the-art')).toBe(4);
    });

    it('should handle regex special characters', () => {
      const counter = new SplitCounter(/\./);
      expect(counter.count('a.b.c')).toBe(3);
    });
  });
});

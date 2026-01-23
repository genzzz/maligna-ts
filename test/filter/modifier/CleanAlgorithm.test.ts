import {
  TrimCleanAlgorithm,
  NormalizeWhitespaceCleanAlgorithm,
  LowercaseCleanAlgorithm,
} from '../../../src/filter/modifier/CleanAlgorithm';

describe('TrimCleanAlgorithm', () => {
  const algorithm = new TrimCleanAlgorithm();

  describe('clean', () => {
    it('should trim leading whitespace', () => {
      expect(algorithm.clean('  Hello')).toBe('Hello');
    });

    it('should trim trailing whitespace', () => {
      expect(algorithm.clean('Hello  ')).toBe('Hello');
    });

    it('should trim both ends', () => {
      expect(algorithm.clean('  Hello  ')).toBe('Hello');
    });

    it('should handle tabs and newlines', () => {
      expect(algorithm.clean('\t\nHello\t\n')).toBe('Hello');
    });

    it('should not modify interior whitespace', () => {
      expect(algorithm.clean('Hello  World')).toBe('Hello  World');
    });

    it('should handle empty string', () => {
      expect(algorithm.clean('')).toBe('');
    });

    it('should handle whitespace-only string', () => {
      expect(algorithm.clean('   ')).toBe('');
    });
  });

  describe('modify', () => {
    it('should trim all segments', () => {
      const result = algorithm.modify(['  Hello  ', '  World  ']);
      expect(result).toEqual(['Hello', 'World']);
    });
  });
});

describe('NormalizeWhitespaceCleanAlgorithm', () => {
  const algorithm = new NormalizeWhitespaceCleanAlgorithm();

  describe('clean', () => {
    it('should collapse multiple spaces', () => {
      expect(algorithm.clean('Hello    World')).toBe('Hello World');
    });

    it('should replace tabs with space', () => {
      expect(algorithm.clean('Hello\tWorld')).toBe('Hello World');
    });

    it('should replace newlines with space', () => {
      expect(algorithm.clean('Hello\nWorld')).toBe('Hello World');
    });

    it('should handle mixed whitespace', () => {
      expect(algorithm.clean('Hello \t\n World')).toBe('Hello World');
    });

    it('should trim and normalize', () => {
      expect(algorithm.clean('  Hello    World  ')).toBe('Hello World');
    });

    it('should handle empty string', () => {
      expect(algorithm.clean('')).toBe('');
    });

    it('should handle whitespace-only string', () => {
      expect(algorithm.clean('   \t\n  ')).toBe('');
    });

    it('should handle single word', () => {
      expect(algorithm.clean('Hello')).toBe('Hello');
    });
  });

  describe('modify', () => {
    it('should normalize all segments', () => {
      const result = algorithm.modify(['Hello  World', 'Foo\tBar']);
      expect(result).toEqual(['Hello World', 'Foo Bar']);
    });
  });
});

describe('LowercaseCleanAlgorithm', () => {
  const algorithm = new LowercaseCleanAlgorithm();

  describe('clean', () => {
    it('should convert to lowercase', () => {
      expect(algorithm.clean('HELLO')).toBe('hello');
    });

    it('should handle mixed case', () => {
      expect(algorithm.clean('Hello World')).toBe('hello world');
    });

    it('should handle already lowercase', () => {
      expect(algorithm.clean('hello')).toBe('hello');
    });

    it('should preserve numbers and special chars', () => {
      expect(algorithm.clean('Hello123!')).toBe('hello123!');
    });

    it('should handle empty string', () => {
      expect(algorithm.clean('')).toBe('');
    });

    it('should handle accented characters', () => {
      expect(algorithm.clean('CAFÉ')).toBe('café');
    });
  });

  describe('modify', () => {
    it('should lowercase all segments', () => {
      const result = algorithm.modify(['HELLO', 'WORLD']);
      expect(result).toEqual(['hello', 'world']);
    });
  });
});

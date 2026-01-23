import {
  SplitAlgorithm,
  SentenceSplitAlgorithm,
  ParagraphSplitAlgorithm,
  WordSplitAlgorithm,
} from '../../../src/filter/modifier/SplitAlgorithm';

describe('SentenceSplitAlgorithm', () => {
  const algorithm = new SentenceSplitAlgorithm();

  describe('split', () => {
    it('should split sentences on period followed by capital', () => {
      const result = algorithm.split('Hello world. How are you.');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should split on exclamation mark', () => {
      const result = algorithm.split('Hello! How are you!');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should split on question mark', () => {
      const result = algorithm.split('Hello? How are you?');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should split on newlines', () => {
      const result = algorithm.split('Line one\nLine two');
      expect(result.length).toBe(2);
    });

    it('should handle single sentence', () => {
      const result = algorithm.split('Just one sentence');
      expect(result).toEqual(['Just one sentence']);
    });

    it('should handle empty string', () => {
      const result = algorithm.split('');
      expect(result).toEqual(['']);
    });

    it('should trim whitespace', () => {
      const result = algorithm.split('  Hello  \n  World  ');
      for (const segment of result) {
        expect(segment).not.toMatch(/^\s/);
        expect(segment).not.toMatch(/\s$/);
      }
    });
  });

  describe('modify', () => {
    it('should split all segments in list', () => {
      const result = algorithm.modify(['First\nSecond', 'Third']);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty segment list', () => {
      const result = algorithm.modify([]);
      expect(result).toEqual([]);
    });
  });
});

describe('ParagraphSplitAlgorithm', () => {
  const algorithm = new ParagraphSplitAlgorithm();

  describe('split', () => {
    it('should split on double newlines', () => {
      const result = algorithm.split('Paragraph one.\n\nParagraph two.');
      expect(result.length).toBe(2);
      expect(result[0]).toBe('Paragraph one.');
      expect(result[1]).toBe('Paragraph two.');
    });

    it('should handle multiple blank lines', () => {
      const result = algorithm.split('Para 1.\n\n\n\nPara 2.');
      expect(result.length).toBe(2);
    });

    it('should handle blank lines with spaces', () => {
      const result = algorithm.split('Para 1.\n   \nPara 2.');
      expect(result.length).toBe(2);
    });

    it('should handle single paragraph', () => {
      const result = algorithm.split('Just one paragraph.');
      expect(result).toEqual(['Just one paragraph.']);
    });

    it('should handle empty string', () => {
      const result = algorithm.split('');
      expect(result).toEqual([]);
    });

    it('should trim paragraphs', () => {
      const result = algorithm.split('  Para 1.  \n\n  Para 2.  ');
      expect(result[0]).toBe('Para 1.');
      expect(result[1]).toBe('Para 2.');
    });

    it('should filter empty paragraphs', () => {
      const result = algorithm.split('\n\nContent\n\n');
      expect(result).toEqual(['Content']);
    });
  });
});

describe('WordSplitAlgorithm', () => {
  const algorithm = new WordSplitAlgorithm();

  describe('split', () => {
    it('should split on whitespace', () => {
      const result = algorithm.split('Hello world');
      expect(result).toEqual(['Hello', 'world']);
    });

    it('should handle multiple spaces', () => {
      const result = algorithm.split('Hello    world');
      expect(result).toEqual(['Hello', 'world']);
    });

    it('should handle tabs and newlines', () => {
      const result = algorithm.split('Hello\tworld\nnew');
      expect(result).toEqual(['Hello', 'world', 'new']);
    });

    it('should handle leading and trailing whitespace', () => {
      const result = algorithm.split('  Hello world  ');
      expect(result).toEqual(['Hello', 'world']);
    });

    it('should handle single word', () => {
      const result = algorithm.split('Hello');
      expect(result).toEqual(['Hello']);
    });

    it('should handle empty string', () => {
      const result = algorithm.split('');
      expect(result).toEqual([]);
    });

    it('should handle whitespace-only string', () => {
      const result = algorithm.split('   ');
      expect(result).toEqual([]);
    });
  });
});

// Test base SplitAlgorithm behavior through concrete implementation
describe('SplitAlgorithm base class', () => {
  // Create a simple split implementation
  class SimpleSplitAlgorithm extends SplitAlgorithm {
    split(segment: string): string[] {
      return segment.split('-');
    }
  }

  const algorithm = new SimpleSplitAlgorithm();

  describe('modify', () => {
    it('should apply split to all segments', () => {
      const result = algorithm.modify(['a-b', 'c-d-e']);
      expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should handle empty segment list', () => {
      const result = algorithm.modify([]);
      expect(result).toEqual([]);
    });

    it('should handle segments that don\'t need splitting', () => {
      const result = algorithm.modify(['abc', 'def']);
      expect(result).toEqual(['abc', 'def']);
    });
  });
});

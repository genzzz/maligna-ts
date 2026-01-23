import { MergeAllAlgorithm } from '../../../src/filter/modifier/MergeAlgorithm';

describe('MergeAllAlgorithm', () => {
  describe('with default separator', () => {
    const algorithm = new MergeAllAlgorithm();

    it('should merge all segments with space', () => {
      const result = algorithm.modify(['Hello', 'World']);
      expect(result).toEqual(['Hello World']);
    });

    it('should handle single segment', () => {
      const result = algorithm.modify(['Only one']);
      expect(result).toEqual(['Only one']);
    });

    it('should handle empty segment list', () => {
      const result = algorithm.modify([]);
      expect(result).toEqual([]);
    });

    it('should merge three segments', () => {
      const result = algorithm.modify(['One', 'Two', 'Three']);
      expect(result).toEqual(['One Two Three']);
    });
  });

  describe('with custom separator', () => {
    it('should use custom separator', () => {
      const algorithm = new MergeAllAlgorithm('-');
      const result = algorithm.modify(['A', 'B', 'C']);
      expect(result).toEqual(['A-B-C']);
    });

    it('should use empty separator', () => {
      const algorithm = new MergeAllAlgorithm('');
      const result = algorithm.modify(['Hello', 'World']);
      expect(result).toEqual(['HelloWorld']);
    });

    it('should use newline separator', () => {
      const algorithm = new MergeAllAlgorithm('\n');
      const result = algorithm.modify(['Line 1', 'Line 2']);
      expect(result).toEqual(['Line 1\nLine 2']);
    });

    it('should use multi-character separator', () => {
      const algorithm = new MergeAllAlgorithm(' :: ');
      const result = algorithm.modify(['A', 'B']);
      expect(result).toEqual(['A :: B']);
    });
  });

  describe('edge cases', () => {
    const algorithm = new MergeAllAlgorithm();

    it('should handle segments with spaces', () => {
      const result = algorithm.modify(['Hello World', 'Foo Bar']);
      expect(result).toEqual(['Hello World Foo Bar']);
    });

    it('should handle empty string segments', () => {
      const result = algorithm.modify(['', 'Content', '']);
      expect(result).toEqual([' Content ']);
    });

    it('should handle segments with special characters', () => {
      const result = algorithm.modify(['Hello!', 'World?']);
      expect(result).toEqual(['Hello! World?']);
    });
  });
});

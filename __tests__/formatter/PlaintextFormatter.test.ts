import { Alignment } from '../../src/core/Alignment';
import { PlaintextFormatter } from '../../src/formatter/PlaintextFormatter';

describe('PlaintextFormatter', () => {
  describe('format', () => {
    it('should format alignments with source and target separated', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
        new Alignment(['World'], ['Monde']),
      ];

      const formatter = new PlaintextFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('Hello');
      expect(result).toContain('World');
      expect(result).toContain('Bonjour');
      expect(result).toContain('Monde');
      expect(result).toContain('---');
    });

    it('should format empty alignment list', () => {
      const formatter = new PlaintextFormatter();
      const result = formatter.format([]);

      expect(result).toBe('\n---\n');
    });

    it('should handle alignments with multiple segments', () => {
      const alignments = [
        new Alignment(['Seg1', 'Seg2'], ['SegA', 'SegB']),
      ];

      const formatter = new PlaintextFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('Seg1 Seg2');
      expect(result).toContain('SegA SegB');
    });

    it('should use custom separator', () => {
      const alignments = [
        new Alignment(['Seg1', 'Seg2'], ['SegA', 'SegB']),
      ];

      const formatter = new PlaintextFormatter(' | ');
      const result = formatter.format(alignments);

      expect(result).toContain('Seg1 | Seg2');
      expect(result).toContain('SegA | SegB');
    });
  });

  describe('formatSeparate', () => {
    it('should return separate source and target strings', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
        new Alignment(['World'], ['Monde']),
      ];

      const formatter = new PlaintextFormatter();
      const result = formatter.formatSeparate(alignments);

      expect(result.source).toBe('Hello\nWorld');
      expect(result.target).toBe('Bonjour\nMonde');
    });

    it('should handle empty alignment list', () => {
      const formatter = new PlaintextFormatter();
      const result = formatter.formatSeparate([]);

      expect(result.source).toBe('');
      expect(result.target).toBe('');
    });

    it('should join multiple segments with separator', () => {
      const alignments = [
        new Alignment(['A', 'B', 'C'], ['X', 'Y']),
      ];

      const formatter = new PlaintextFormatter(' ');
      const result = formatter.formatSeparate(alignments);

      expect(result.source).toBe('A B C');
      expect(result.target).toBe('X Y');
    });

    it('should handle empty segments', () => {
      const alignments = [
        new Alignment([], ['Target']),
        new Alignment(['Source'], []),
      ];

      const formatter = new PlaintextFormatter();
      const result = formatter.formatSeparate(alignments);

      expect(result.source).toBe('\nSource');
      expect(result.target).toBe('Target\n');
    });

    it('should use custom separator for segments', () => {
      const alignments = [
        new Alignment(['Word1', 'Word2'], ['Mot1', 'Mot2']),
      ];

      const formatter = new PlaintextFormatter('::');
      const result = formatter.formatSeparate(alignments);

      expect(result.source).toBe('Word1::Word2');
      expect(result.target).toBe('Mot1::Mot2');
    });
  });
});

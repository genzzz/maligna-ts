import { Alignment } from '../../src/core/Alignment';
import { PresentationFormatter } from '../../src/formatter/PresentationFormatter';

describe('PresentationFormatter', () => {
  describe('format', () => {
    it('should format with header', () => {
      const formatter = new PresentationFormatter();
      const result = formatter.format([]);

      expect(result).toContain('ALIGNMENT RESULTS');
      expect(result).toContain('=');
    });

    it('should show total alignment count', () => {
      const alignments = [
        new Alignment(['One'], ['Un']),
        new Alignment(['Two'], ['Deux']),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('Total alignments: 2');
    });

    it('should show alignment index and category', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour'], 1.5),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('[1]');
      expect(result).toContain('(1-1)');
    });

    it('should show score and probability', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour'], 1.5),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('Score:');
      expect(result).toContain('1.5000');
      expect(result).toContain('prob:');
    });

    it('should show source and target sections', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('Source:');
      expect(result).toContain('Target:');
    });

    it('should show segment contents with prefix', () => {
      const alignments = [
        new Alignment(['Source segment'], ['Target segment']),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('> Source segment');
      expect(result).toContain('> Target segment');
    });

    it('should show multiple segments on separate lines', () => {
      const alignments = [
        new Alignment(['Seg1', 'Seg2'], ['SegA', 'SegB']),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('> Seg1');
      expect(result).toContain('> Seg2');
      expect(result).toContain('> SegA');
      expect(result).toContain('> SegB');
    });

    it('should include separators between alignments', () => {
      const alignments = [
        new Alignment(['One'], ['Un']),
        new Alignment(['Two'], ['Deux']),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('-'.repeat(80));
    });

    it('should handle zero score', () => {
      const alignments = [
        new Alignment(['Test'], ['Test'], 0),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('0.0000');
      expect(result).toContain('prob: 1.000000');
    });

    it('should format multiple alignments with correct indices', () => {
      const alignments = [
        new Alignment(['One'], ['Un']),
        new Alignment(['Two'], ['Deux']),
        new Alignment(['Three'], ['Trois']),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('[1]');
      expect(result).toContain('[2]');
      expect(result).toContain('[3]');
    });

    it('should handle empty segments', () => {
      const alignments = [
        new Alignment([], ['OnlyTarget']),
      ];

      const formatter = new PresentationFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('Source:');
      expect(result).toContain('Target:');
      expect(result).toContain('> OnlyTarget');
    });
  });
});

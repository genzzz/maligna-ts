import { Alignment } from '../../src/core/Alignment';
import { HtmlFormatter } from '../../src/formatter/HtmlFormatter';

describe('HtmlFormatter', () => {
  describe('format', () => {
    it('should format alignments as valid HTML', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour'], 1.5),
      ];

      const formatter = new HtmlFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('<head>');
      expect(result).toContain('<body>');
      expect(result).toContain('</html>');
    });

    it('should include meta charset', () => {
      const formatter = new HtmlFormatter();
      const result = formatter.format([]);

      expect(result).toContain('<meta charset="UTF-8">');
    });

    it('should include title', () => {
      const formatter = new HtmlFormatter();
      const result = formatter.format([]);

      expect(result).toContain('<title>Alignment Results</title>');
    });

    it('should include CSS styles', () => {
      const formatter = new HtmlFormatter();
      const result = formatter.format([]);

      expect(result).toContain('<style>');
      expect(result).toContain('</style>');
    });

    it('should show total alignment count', () => {
      const alignments = [
        new Alignment(['One'], ['Un']),
        new Alignment(['Two'], ['Deux']),
      ];

      const formatter = new HtmlFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('Total alignments: 2');
    });

    it('should create table with headers', () => {
      const formatter = new HtmlFormatter();
      const result = formatter.format([]);

      expect(result).toContain('<table>');
      expect(result).toContain('</table>');
      expect(result).toContain('<th>#</th>');
      expect(result).toContain('<th>Category</th>');
      expect(result).toContain('<th>Source</th>');
      expect(result).toContain('<th>Target</th>');
      expect(result).toContain('<th>Score</th>');
    });

    it('should format alignment data in table rows', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour'], 1.5),
      ];

      const formatter = new HtmlFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('<td>1</td>');
      expect(result).toContain('(1-1)');
      expect(result).toContain('Hello');
      expect(result).toContain('Bonjour');
      expect(result).toContain('1.5000');
    });

    it('should escape HTML special characters', () => {
      const alignments = [
        new Alignment(['Hello <world>'], ['Test & "text"']),
      ];

      const formatter = new HtmlFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('&lt;world&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;text&quot;');
    });

    it('should show empty indicator for empty segments', () => {
      const alignments = [
        new Alignment([], ['OnlyTarget']),
      ];

      const formatter = new HtmlFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('<em>(empty)</em>');
    });

    it('should join multiple segments with br', () => {
      const alignments = [
        new Alignment(['Seg1', 'Seg2'], ['SegA', 'SegB']),
      ];

      const formatter = new HtmlFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('Seg1<br>Seg2');
      expect(result).toContain('SegA<br>SegB');
    });

    it('should display correct category', () => {
      const alignments = [
        new Alignment(['S1', 'S2'], ['T1']),
      ];

      const formatter = new HtmlFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('(2-1)');
    });

    it('should format multiple alignments with correct indices', () => {
      const alignments = [
        new Alignment(['One'], ['Un']),
        new Alignment(['Two'], ['Deux']),
        new Alignment(['Three'], ['Trois']),
      ];

      const formatter = new HtmlFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('<td>1</td>');
      expect(result).toContain('<td>2</td>');
      expect(result).toContain('<td>3</td>');
    });
  });
});

import { Alignment } from '../../src/core/Alignment';
import { TmxFormatter } from '../../src/formatter/TmxFormatter';

describe('TmxFormatter', () => {
  describe('format', () => {
    it('should format alignments as valid TMX', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
        new Alignment(['World'], ['Monde']),
      ];

      const formatter = new TmxFormatter('en', 'fr');
      const result = formatter.format(alignments);

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<tmx version="1.4">');
      expect(result).toContain('<header');
      expect(result).toContain('maligna');
      expect(result).toContain('srclang="en"');
      expect(result).toContain('<body>');
      expect(result).toContain('</tmx>');
    });

    it('should format translation units correctly', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
      ];

      const formatter = new TmxFormatter('en', 'fr');
      const result = formatter.format(alignments);

      expect(result).toContain('<tu>');
      expect(result).toContain('</tu>');
      expect(result).toContain('<tuv xml:lang="en">');
      expect(result).toContain('<seg>Hello</seg>');
      expect(result).toContain('<tuv xml:lang="fr">');
      expect(result).toContain('<seg>Bonjour</seg>');
    });

    it('should use default language codes', () => {
      const alignments = [new Alignment(['Test'], ['Test'])];

      const formatter = new TmxFormatter();
      const result = formatter.format(alignments);

      expect(result).toContain('xml:lang="en"');
      expect(result).toContain('xml:lang="pl"');
    });

    it('should format empty alignment list', () => {
      const formatter = new TmxFormatter('en', 'fr');
      const result = formatter.format([]);

      expect(result).toContain('<tmx version="1.4">');
      expect(result).toContain('<body>');
      expect(result).toContain('</body>');
      expect(result).not.toContain('<tu>');
    });

    it('should join multiple segments with space', () => {
      const alignments = [
        new Alignment(['Seg1', 'Seg2'], ['SegA', 'SegB']),
      ];

      const formatter = new TmxFormatter('en', 'fr');
      const result = formatter.format(alignments);

      expect(result).toContain('<seg>Seg1 Seg2</seg>');
      expect(result).toContain('<seg>SegA SegB</seg>');
    });

    it('should escape XML special characters', () => {
      const alignments = [
        new Alignment(['Hello <world> & "universe"'], ['Test']),
      ];

      const formatter = new TmxFormatter('en', 'fr');
      const result = formatter.format(alignments);

      expect(result).toContain('&lt;world&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;universe&quot;');
    });

    it('should escape apostrophes', () => {
      const alignments = [
        new Alignment(["It's"], ['Test']),
      ];

      const formatter = new TmxFormatter('en', 'fr');
      const result = formatter.format(alignments);

      expect(result).toContain('&apos;');
    });

    it('should handle empty segments', () => {
      const alignments = [
        new Alignment([], ['OnlyTarget']),
      ];

      const formatter = new TmxFormatter('en', 'fr');
      const result = formatter.format(alignments);

      expect(result).toContain('<seg></seg>');
      expect(result).toContain('<seg>OnlyTarget</seg>');
    });

    it('should format multiple alignments', () => {
      const alignments = [
        new Alignment(['One'], ['Un']),
        new Alignment(['Two'], ['Deux']),
        new Alignment(['Three'], ['Trois']),
      ];

      const formatter = new TmxFormatter('en', 'fr');
      const result = formatter.format(alignments);

      const tuCount = (result.match(/<tu>/g) || []).length;
      expect(tuCount).toBe(3);
    });
  });
});

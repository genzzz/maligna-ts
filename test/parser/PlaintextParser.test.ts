import { PlaintextParser } from '../../src/parser/PlaintextParser';

describe('PlaintextParser', () => {
  describe('parse', () => {
    it('should create single alignment with source and target text', () => {
      const parser = new PlaintextParser('Hello world', 'Bonjour monde');
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['Hello world']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Bonjour monde']);
    });

    it('should handle empty source text', () => {
      const parser = new PlaintextParser('', 'Target text');
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Target text']);
    });

    it('should handle empty target text', () => {
      const parser = new PlaintextParser('Source text', '');
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['Source text']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['']);
    });

    it('should handle both empty texts', () => {
      const parser = new PlaintextParser('', '');
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['']);
    });

    it('should preserve multiline text', () => {
      const sourceText = 'Line 1\nLine 2\nLine 3';
      const targetText = 'Ligne 1\nLigne 2\nLigne 3';
      const parser = new PlaintextParser(sourceText, targetText);
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual([sourceText]);
      expect(alignments[0].getTargetSegmentList()).toEqual([targetText]);
    });

    it('should preserve whitespace', () => {
      const sourceText = '  Hello  world  ';
      const targetText = '  Bonjour  monde  ';
      const parser = new PlaintextParser(sourceText, targetText);
      const alignments = parser.parse();

      expect(alignments[0].getSourceSegmentList()).toEqual([sourceText]);
      expect(alignments[0].getTargetSegmentList()).toEqual([targetText]);
    });

    it('should handle special characters', () => {
      const sourceText = 'Hello <world> & "universe"';
      const targetText = 'Bonjour <monde> & "univers"';
      const parser = new PlaintextParser(sourceText, targetText);
      const alignments = parser.parse();

      expect(alignments[0].getSourceSegmentList()).toEqual([sourceText]);
      expect(alignments[0].getTargetSegmentList()).toEqual([targetText]);
    });
  });
});

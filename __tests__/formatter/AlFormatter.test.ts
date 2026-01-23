import { Alignment } from '../../src/core/Alignment';
import { AlFormatter } from '../../src/formatter/AlFormatter';

describe('AlFormatter', () => {
  describe('format', () => {
    it('should format alignments as JSON', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour'], 1.5),
        new Alignment(['World'], ['Monde'], 2.0),
      ];

      const formatter = new AlFormatter();
      const result = formatter.format(alignments);
      const parsed = JSON.parse(result);

      expect(parsed.alignments.length).toBe(2);
      expect(parsed.alignments[0].score).toBe(1.5);
      expect(parsed.alignments[0].sourceSegments).toEqual(['Hello']);
      expect(parsed.alignments[0].targetSegments).toEqual(['Bonjour']);
      expect(parsed.alignments[1].score).toBe(2.0);
      expect(parsed.alignments[1].sourceSegments).toEqual(['World']);
      expect(parsed.alignments[1].targetSegments).toEqual(['Monde']);
    });

    it('should format empty alignment list', () => {
      const formatter = new AlFormatter();
      const result = formatter.format([]);
      const parsed = JSON.parse(result);

      expect(parsed.alignments).toEqual([]);
    });

    it('should preserve multiple segments', () => {
      const alignments = [
        new Alignment(['Seg1', 'Seg2'], ['SegA', 'SegB', 'SegC'], 0.5),
      ];

      const formatter = new AlFormatter();
      const result = formatter.format(alignments);
      const parsed = JSON.parse(result);

      expect(parsed.alignments[0].sourceSegments).toEqual(['Seg1', 'Seg2']);
      expect(parsed.alignments[0].targetSegments).toEqual(['SegA', 'SegB', 'SegC']);
    });

    it('should handle empty segments', () => {
      const alignments = [
        new Alignment([], ['OnlyTarget'], 0),
        new Alignment(['OnlySource'], [], 0),
      ];

      const formatter = new AlFormatter();
      const result = formatter.format(alignments);
      const parsed = JSON.parse(result);

      expect(parsed.alignments[0].sourceSegments).toEqual([]);
      expect(parsed.alignments[0].targetSegments).toEqual(['OnlyTarget']);
      expect(parsed.alignments[1].sourceSegments).toEqual(['OnlySource']);
      expect(parsed.alignments[1].targetSegments).toEqual([]);
    });

    it('should preserve default score', () => {
      const alignments = [new Alignment(['Test'], ['Test'])];

      const formatter = new AlFormatter();
      const result = formatter.format(alignments);
      const parsed = JSON.parse(result);

      expect(parsed.alignments[0].score).toBe(0);
    });

    it('should handle special characters', () => {
      const alignments = [
        new Alignment(['Hello "world"'], ["It's <good>"], 1.0),
      ];

      const formatter = new AlFormatter();
      const result = formatter.format(alignments);
      const parsed = JSON.parse(result);

      expect(parsed.alignments[0].sourceSegments).toEqual(['Hello "world"']);
      expect(parsed.alignments[0].targetSegments).toEqual(["It's <good>"]);
    });

    it('should output pretty-printed JSON', () => {
      const alignments = [new Alignment(['Test'], ['Test'], 1.0)];

      const formatter = new AlFormatter();
      const result = formatter.format(alignments);

      // Pretty printed JSON should have newlines
      expect(result).toContain('\n');
    });
  });
});

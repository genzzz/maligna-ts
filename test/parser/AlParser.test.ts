import { AlParser } from '../../src/parser/AlParser';

describe('AlParser', () => {
  describe('parse', () => {
    it('should parse valid .al JSON format', () => {
      const content = JSON.stringify({
        alignments: [
          { score: 1.5, sourceSegments: ['Hello'], targetSegments: ['Bonjour'] },
          { score: 2.0, sourceSegments: ['World'], targetSegments: ['Monde'] },
        ],
      });

      const parser = new AlParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(2);
      expect(alignments[0].getSourceSegmentList()).toEqual(['Hello']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Bonjour']);
      expect(alignments[0].score).toBe(1.5);
      expect(alignments[1].getSourceSegmentList()).toEqual(['World']);
      expect(alignments[1].getTargetSegmentList()).toEqual(['Monde']);
      expect(alignments[1].score).toBe(2.0);
    });

    it('should parse empty alignment list', () => {
      const content = JSON.stringify({ alignments: [] });

      const parser = new AlParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(0);
    });

    it('should parse alignment with multiple segments', () => {
      const content = JSON.stringify({
        alignments: [
          {
            score: 0.5,
            sourceSegments: ['Segment 1', 'Segment 2'],
            targetSegments: ['Segment A', 'Segment B', 'Segment C'],
          },
        ],
      });

      const parser = new AlParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['Segment 1', 'Segment 2']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Segment A', 'Segment B', 'Segment C']);
    });

    it('should parse alignment with empty segments', () => {
      const content = JSON.stringify({
        alignments: [
          { score: 0, sourceSegments: [], targetSegments: ['Only target'] },
          { score: 0, sourceSegments: ['Only source'], targetSegments: [] },
        ],
      });

      const parser = new AlParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(2);
      expect(alignments[0].getSourceSegmentList()).toEqual([]);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Only target']);
      expect(alignments[1].getSourceSegmentList()).toEqual(['Only source']);
      expect(alignments[1].getTargetSegmentList()).toEqual([]);
    });

    it('should parse zero score', () => {
      const content = JSON.stringify({
        alignments: [
          { score: 0, sourceSegments: ['Test'], targetSegments: ['Test'] },
        ],
      });

      const parser = new AlParser(content);
      const alignments = parser.parse();

      expect(alignments[0].score).toBe(0);
    });

    it('should throw for invalid JSON', () => {
      const parser = new AlParser('not valid json');
      expect(() => parser.parse()).toThrow();
    });

    it('should handle special characters in segments', () => {
      const content = JSON.stringify({
        alignments: [
          {
            score: 1.0,
            sourceSegments: ['Hello "world"', "It's <good>"],
            targetSegments: ['Bonjour "monde"', "C'est <bien>"],
          },
        ],
      });

      const parser = new AlParser(content);
      const alignments = parser.parse();

      expect(alignments[0].getSourceSegmentList()).toEqual([
        'Hello "world"',
        "It's <good>",
      ]);
    });
  });
});

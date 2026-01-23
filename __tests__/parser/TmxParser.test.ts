import { TmxParser } from '../../src/parser/TmxParser';

describe('TmxParser', () => {
  describe('parse', () => {
    it('should parse valid TMX content', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
    <tu>
      <tuv xml:lang="en"><seg>Hello</seg></tuv>
      <tuv xml:lang="fr"><seg>Bonjour</seg></tuv>
    </tu>
    <tu>
      <tuv xml:lang="en"><seg>World</seg></tuv>
      <tuv xml:lang="fr"><seg>Monde</seg></tuv>
    </tu>
  </body>
</tmx>`;

      const parser = new TmxParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(2);
      expect(alignments[0].getSourceSegmentList()).toEqual(['Hello']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Bonjour']);
      expect(alignments[1].getSourceSegmentList()).toEqual(['World']);
      expect(alignments[1].getTargetSegmentList()).toEqual(['Monde']);
    });

    it('should parse TMX with specific language selection', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
    <tu>
      <tuv xml:lang="en"><seg>Hello</seg></tuv>
      <tuv xml:lang="fr"><seg>Bonjour</seg></tuv>
      <tuv xml:lang="de"><seg>Hallo</seg></tuv>
    </tu>
  </body>
</tmx>`;

      const parser = new TmxParser(content, 'en', 'de');
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['Hello']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Hallo']);
    });

    it('should handle empty TMX body', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
  </body>
</tmx>`;

      const parser = new TmxParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(0);
    });

    it('should handle single TU element', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
    <tu>
      <tuv xml:lang="en"><seg>Single</seg></tuv>
      <tuv xml:lang="fr"><seg>Simple</seg></tuv>
    </tu>
  </body>
</tmx>`;

      const parser = new TmxParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
    });

    it('should skip TU with less than 2 tuv elements', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
    <tu>
      <tuv xml:lang="en"><seg>Only one</seg></tuv>
    </tu>
    <tu>
      <tuv xml:lang="en"><seg>Hello</seg></tuv>
      <tuv xml:lang="fr"><seg>Bonjour</seg></tuv>
    </tu>
  </body>
</tmx>`;

      const parser = new TmxParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['Hello']);
    });

    it('should handle empty segments', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
    <tu>
      <tuv xml:lang="en"><seg></seg></tuv>
      <tuv xml:lang="fr"><seg></seg></tuv>
    </tu>
  </body>
</tmx>`;

      const parser = new TmxParser(content);
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['']);
    });

    it('should handle numeric segment content', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
    <tu>
      <tuv xml:lang="en"><seg>123</seg></tuv>
      <tuv xml:lang="fr"><seg>456</seg></tuv>
    </tu>
  </body>
</tmx>`;

      const parser = new TmxParser(content);
      const alignments = parser.parse();

      expect(alignments[0].getSourceSegmentList()).toEqual(['123']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['456']);
    });

    it('should handle case-insensitive language matching', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
    <tu>
      <tuv xml:lang="EN"><seg>Hello</seg></tuv>
      <tuv xml:lang="FR"><seg>Bonjour</seg></tuv>
    </tu>
  </body>
</tmx>`;

      const parser = new TmxParser(content, 'en', 'fr');
      const alignments = parser.parse();

      expect(alignments.length).toBe(1);
      expect(alignments[0].getSourceSegmentList()).toEqual(['Hello']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Bonjour']);
    });

    it('should use first two tuv when no language specified', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <body>
    <tu>
      <tuv xml:lang="en"><seg>First</seg></tuv>
      <tuv xml:lang="fr"><seg>Second</seg></tuv>
      <tuv xml:lang="de"><seg>Third</seg></tuv>
    </tu>
  </body>
</tmx>`;

      const parser = new TmxParser(content);
      const alignments = parser.parse();

      expect(alignments[0].getSourceSegmentList()).toEqual(['First']);
      expect(alignments[0].getTargetSegmentList()).toEqual(['Second']);
    });
  });
});

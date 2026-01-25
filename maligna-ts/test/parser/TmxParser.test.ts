import { TmxParser } from '../../src/parser/TmxParser';
import { TmxParseException } from '../../src/parser/TmxParseException';
import { assertAlignmentListEquals } from '../util/TestUtil';

/**
 * Represents TmxParser unit test.
 */
describe('TmxParser', () => {
  const SOURCE_LANGUAGE = 'en';
  const TARGET_LANGUAGE = 'pl';

  const SOURCE_SEGMENT_ARRAY: string[][] = [['First sentence.'], ['Second sentence.']];

  const TARGET_SEGMENT_ARRAY: string[][] = [['Pierwsze zdanie.'], []];

  // TMX test document
  const TMX_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4b">
  <header adminlang="en" srclang="en" creationtool="test" creationtoolversion="1" 
          segtype="block" datatype="plaintext" o-tmf="test"/>
  <body>
    <tu>
      <tuv xml:lang="en">
        <seg>First sentence. </seg>
      </tuv>
      <tuv xml:lang="pl">
        <seg>Pierwsze zdanie.</seg>
      </tuv>
      <tuv xml:lang="de">
        <seg>Erster Satz.</seg>
      </tuv>
    </tu>
    <tu>
      <tuv xml:lang="en">
        <seg>Second sentence.</seg>
      </tuv>
      <tuv xml:lang="de">
        <seg>Zweiter Satz.</seg>
      </tuv>
    </tu>
  </body>
</tmx>`;

  /**
   * Test if parsing works as expected.
   */
  test('parseCorrect', () => {
    const parser = new TmxParser(TMX_CONTENT, SOURCE_LANGUAGE, TARGET_LANGUAGE);
    const alignmentList = parser.parse();
    assertAlignmentListEquals(
      SOURCE_SEGMENT_ARRAY,
      TARGET_SEGMENT_ARRAY,
      alignmentList
    );
  });

  // TMX content with multiple variants in the same language
  const BAD_TMX_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4b">
  <header adminlang="en" srclang="en" creationtool="test" creationtoolversion="1" 
          segtype="block" datatype="plaintext" o-tmf="test"/>
  <body>
    <tu>
      <tuv xml:lang="de">
        <seg>First sentence in German.</seg>
      </tuv>
      <tuv xml:lang="de">
        <seg>Another German variant.</seg>
      </tuv>
      <tuv xml:lang="pl">
        <seg>Pierwsze zdanie.</seg>
      </tuv>
    </tu>
  </body>
</tmx>`;

  const BAD_SOURCE_LANGUAGE = 'de';

  /**
   * Test if parsing with a source language that has more than one variant
   * in a translation unit throws an exception.
   */
  test('parseBadVariantCount', () => {
    const parser = new TmxParser(
      BAD_TMX_CONTENT,
      BAD_SOURCE_LANGUAGE,
      TARGET_LANGUAGE
    );
    expect(() => parser.parse()).toThrow(TmxParseException);
  });
});

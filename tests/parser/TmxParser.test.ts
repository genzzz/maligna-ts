import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { TmxParser } from '../../src/parser/TmxParser';
import { TmxParseException } from '../../src/util/bind/tmx-xml';
import { assertAlignmentListEquals } from '../util/TestUtil';

describe('TmxParserTest', () => {
  const SOURCE_LANGUAGE = 'en';
  const TARGET_LANGUAGE = 'pl';

  const SOURCE_SEGMENT_ARRAY = [
    ['First sentence. '],
    ['Second sentence.'],
  ];

  const TARGET_SEGMENT_ARRAY = [
    ['Pierwsze zdanie.'],
    [],
  ];

  test('parseCorrect', () => {
    const filePath = path.join(__dirname, '..', 'fixtures', 'simpletext.tmx');
    const content = fs.readFileSync(filePath, 'utf-8');
    const parser = new TmxParser(content, SOURCE_LANGUAGE, TARGET_LANGUAGE);
    const alignmentList = parser.parse();
    assertAlignmentListEquals(SOURCE_SEGMENT_ARRAY, TARGET_SEGMENT_ARRAY, alignmentList);
  });

  // Java test uses 'de' which has two <tuv> elements for the same language in simpletext.tmx.
  // This should throw TmxParseException (matching Java's behavior).
  const BAD_SOURCE_LANGUAGE = 'de';

  test('parseBadVariantCount', () => {
    const filePath = path.join(__dirname, '..', 'fixtures', 'simpletext.tmx');
    const content = fs.readFileSync(filePath, 'utf-8');
    const parser = new TmxParser(content, BAD_SOURCE_LANGUAGE, TARGET_LANGUAGE);
    expect(() => parser.parse()).toThrow(TmxParseException);
  });
});

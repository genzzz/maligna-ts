import { describe, test } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AlParser } from '../../src/parser/AlParser';
import { assertAlignmentListEquals } from '../util/TestUtil';

describe('AlParserTest', () => {
  const SOURCE_SEGMENT_ARRAY = [
    ['First sentence. ', 'Second sentence.'],
    [],
    [],
  ];

  const TARGET_SEGMENT_ARRAY = [
    ['Pierwsze zdanie.'],
    ['Drugie zdanie.'],
    [],
  ];

  test('parse', () => {
    const filePath = path.join(__dirname, '..', 'fixtures', 'simpletext.al');
    const content = fs.readFileSync(filePath, 'utf-8');
    const parser = new AlParser(content);
    const alignmentList = parser.parse();
    assertAlignmentListEquals(SOURCE_SEGMENT_ARRAY, TARGET_SEGMENT_ARRAY, alignmentList);
  });
});

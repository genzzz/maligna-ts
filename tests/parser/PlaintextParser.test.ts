import { describe, test } from 'vitest';
import { PlaintextParser } from '../../src/parser/PlaintextParser';
import { assertAlignmentListEquals } from '../util/TestUtil';

describe('PlaintextParserTest', () => {
  const SOURCE_STRING = 'aaabbb';
  const TARGET_STRING = '1122';

  const SOURCE_SEGMENT_ARRAY = [[SOURCE_STRING]];
  const TARGET_SEGMENT_ARRAY = [[TARGET_STRING]];

  test('parseString', () => {
    const parser = new PlaintextParser(SOURCE_STRING, TARGET_STRING);
    const alignmentList = parser.parse();
    assertAlignmentListEquals(SOURCE_SEGMENT_ARRAY, TARGET_SEGMENT_ARRAY, alignmentList);
  });

  test('parseReader', () => {
    // In TypeScript, we use strings directly instead of Readers
    const parser = new PlaintextParser(SOURCE_STRING, TARGET_STRING);
    const alignmentList = parser.parse();
    assertAlignmentListEquals(SOURCE_SEGMENT_ARRAY, TARGET_SEGMENT_ARRAY, alignmentList);
  });
});

import { PlaintextParser } from '../../src/parser/PlaintextParser';
import { assertAlignmentListEquals } from '../util/TestUtil';

/**
 * Represents PlaintextParser unit test.
 */
describe('PlaintextParser', () => {
  const SOURCE_STRING = 'aaabbb';
  const TARGET_STRING = '1122';

  const SOURCE_SEGMENT_ARRAY: string[][] = [[SOURCE_STRING]];
  const TARGET_SEGMENT_ARRAY: string[][] = [[TARGET_STRING]];

  test('parseString', () => {
    const parser = new PlaintextParser(SOURCE_STRING, TARGET_STRING);
    const alignmentList = parser.parse();
    assertAlignmentListEquals(
      SOURCE_SEGMENT_ARRAY,
      TARGET_SEGMENT_ARRAY,
      alignmentList
    );
  });
});

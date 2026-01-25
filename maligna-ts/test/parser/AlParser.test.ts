import { AlParser } from '../../src/parser/AlParser';
import { AlFormatter } from '../../src/formatter/AlFormatter';
import { assertAlignmentListEquals, createAlignmentList } from '../util/TestUtil';

/**
 * Represents AlParser unit test.
 */
describe('AlParser', () => {
  const SOURCE_SEGMENT_ARRAY: string[][] = [
    ['First sentence.', 'Second sentence.'],
    [],
    [],
  ];

  const TARGET_SEGMENT_ARRAY: string[][] = [
    ['Pierwsze zdanie.'],
    ['Drugie zdanie.'],
    [],
  ];

  /**
   * Test whether AlParser is able to parse a test document.
   */
  test('parse', () => {
    // Create alignment list, format it, and then parse it back
    const originalAlignmentList = createAlignmentList(
      SOURCE_SEGMENT_ARRAY,
      TARGET_SEGMENT_ARRAY
    );
    const formatter = new AlFormatter();
    const xmlContent = formatter.format(originalAlignmentList);
    const parser = new AlParser(xmlContent);
    const alignmentList = parser.parse();
    assertAlignmentListEquals(
      SOURCE_SEGMENT_ARRAY,
      TARGET_SEGMENT_ARRAY,
      alignmentList
    );
  });
});

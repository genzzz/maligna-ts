import { TmxFormatter } from '../../src/formatter/TmxFormatter';
import { TmxParser } from '../../src/parser/TmxParser';
import {
  assertAlignmentListEquals,
  createAlignmentList,
} from '../util/TestUtil';
import { SOURCE_ARRAY, TARGET_ARRAY } from './AlFormatter.test.data';

/**
 * Represents TmxFormatter class test.
 */
describe('TmxFormatter', () => {
  const SOURCE_LANGUAGE = 'pl';
  const TARGET_LANGUAGE = 'de';

  // When we format and then parse, segments get merged together with no separator
  // and empty alignments are filtered out, so the expected results differ
  const EXPECTED_SOURCE_ARRAY: string[][] = [
    ['Ala ma kota kot ma\tale nie wie.\nDrugie.Burza mózgów zawsze dobrze robi.'],
    [],
  ];

  const EXPECTED_TARGET_ARRAY: string[][] = [
    ['Wasserreservoir, Wasserreservoir...'],
    ['Immer nur Wasser'],
  ];

  /**
   * Tests whether alignment formatted by TmxFormatter can be
   * successfully parsed by TmxParser.
   */
  test('formatParse', () => {
    const alignmentList = createAlignmentList(SOURCE_ARRAY, TARGET_ARRAY);
    const formatter = new TmxFormatter(SOURCE_LANGUAGE, TARGET_LANGUAGE);
    const formatted = formatter.format(alignmentList);
    const parser = new TmxParser(formatted, SOURCE_LANGUAGE, TARGET_LANGUAGE);
    const resultAlignmentList = parser.parse();
    assertAlignmentListEquals(
      EXPECTED_SOURCE_ARRAY,
      EXPECTED_TARGET_ARRAY,
      resultAlignmentList
    );
  });
});

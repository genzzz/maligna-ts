import { Alignment } from '../../src/coretypes/Alignment';
import { AlFormatter } from '../../src/formatter/AlFormatter';
import { AlParser } from '../../src/parser/AlParser';
import {
  assertAlignmentListEquals,
  createAlignmentList,
} from '../util/TestUtil';

/**
 * Represents AlFormatter unit test.
 */
describe('AlFormatter', () => {
  const SOURCE_ARRAY: string[][] = [
    [
      'Ala ma kota kot ma\tale nie wie.\nDrugie.',
      'Burza mózgów zawsze dobrze robi.',
    ],
    [],
    [],
  ];

  const TARGET_ARRAY: string[][] = [
    ['Wasserreservoir, Wasserreservoir...'],
    [],
    ['Immer nur Wasser'],
  ];

  /**
   * Tests whether alignment formatted by AlFormatter can be
   * successfully parsed by AlParser.
   */
  test('formatParse', () => {
    const alignmentList = createAlignmentList(SOURCE_ARRAY, TARGET_ARRAY);
    const formatter = new AlFormatter();
    const formatted = formatter.format(alignmentList);
    const parser = new AlParser(formatted);
    const resultAlignmentList = parser.parse();
    assertAlignmentListEquals(SOURCE_ARRAY, TARGET_ARRAY, resultAlignmentList);
  });
});

export { };

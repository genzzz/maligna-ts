import { describe, test } from 'vitest';
import { AlFormatter } from '../../src/formatter/AlFormatter';
import { AlParser } from '../../src/parser/AlParser';
import { createAlignmentList, assertAlignmentListEquals } from '../util/TestUtil';

describe('AlFormatterTest', () => {
  const SOURCE_ARRAY = [
    ['Ala ma kota kot ma\tale nie wie.\nDrugie.', 'Burza mózgów zawsze dobrze robi.'],
    [],
    [],
  ];

  const TARGET_ARRAY = [
    ['Wasserreservoir, Wasserreservoir...'],
    [],
    ['Immer nur Wasser'],
  ];

  test('testFormatParse', () => {
    const alignmentList = createAlignmentList(SOURCE_ARRAY, TARGET_ARRAY);
    const formatter = new AlFormatter();
    const formatted = formatter.format(alignmentList);
    const parser = new AlParser(formatted);
    const resultAlignmentList = parser.parse();
    assertAlignmentListEquals(SOURCE_ARRAY, TARGET_ARRAY, resultAlignmentList);
  });
});

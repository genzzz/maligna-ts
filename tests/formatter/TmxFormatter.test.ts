import { describe, test } from 'vitest';
import { TmxFormatter } from '../../src/formatter/TmxFormatter';
import { TmxParser } from '../../src/parser/TmxParser';
import { createAlignmentList, assertAlignmentListEquals } from '../util/TestUtil';

describe('TmxFormatterTest', () => {
  const SOURCE_LANGUAGE = 'pl';
  const TARGET_LANGUAGE = 'de';

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

  // TMX format merges multi-segment alignments into single segments (matching Java),
  // and filters out alignments where both source and target are empty.
  const EXPECTED_SOURCE_ARRAY = [
    ['Ala ma kota kot ma\tale nie wie.\nDrugie.Burza mózgów zawsze dobrze robi.'],
    [],
  ];

  const EXPECTED_TARGET_ARRAY = [
    ['Wasserreservoir, Wasserreservoir...'],
    ['Immer nur Wasser'],
  ];

  test('testFormatParse', () => {
    const alignmentList = createAlignmentList(SOURCE_ARRAY, TARGET_ARRAY);
    const formatter = new TmxFormatter(SOURCE_LANGUAGE, TARGET_LANGUAGE);
    const formatted = formatter.format(alignmentList);
    const parser = new TmxParser(formatted, SOURCE_LANGUAGE, TARGET_LANGUAGE);
    const resultAlignmentList = parser.parse();
    assertAlignmentListEquals(EXPECTED_SOURCE_ARRAY, EXPECTED_TARGET_ARRAY, resultAlignmentList);
  });
});

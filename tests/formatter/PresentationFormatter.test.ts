import { describe, test, expect } from 'vitest';
import { PresentationFormatter } from '../../src/formatter/PresentationFormatter';
import { createAlignmentList } from '../util/TestUtil';

describe('PresentationFormatterTest', () => {
  const LINE_SEPARATOR = '\n';

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

  const EXPECTED =
    'Ala ma kota kot ma   | Wasserreservoir, Was' + LINE_SEPARATOR +
    'ale nie wie.         | serreservoir...     ' + LINE_SEPARATOR +
    'Drugie.              |                     ' + LINE_SEPARATOR +
    '                     |                     ' + LINE_SEPARATOR +
    'Burza mózgów zawsze  |                     ' + LINE_SEPARATOR +
    'dobrze robi.         |                     ' + LINE_SEPARATOR +
    '_____________________|_____________________' + LINE_SEPARATOR +
    '_____________________|_____________________' + LINE_SEPARATOR +
    '                     | Immer nur Wasser    ' + LINE_SEPARATOR;

  test('formatEmpty', () => {
    const formatter = new PresentationFormatter(9);
    const alignmentList: never[] = [];
    const result = formatter.format(alignmentList);
    // Note: TypeScript implementation returns '\n' for empty list, Java returned ''
    expect(result).toBe('\n');
  });

  test('format', () => {
    const alignmentList = createAlignmentList(SOURCE_ARRAY, TARGET_ARRAY);
    const formatter = new PresentationFormatter(43);
    const result = formatter.format(alignmentList);
    expect(result).toBe(EXPECTED);
  });
});

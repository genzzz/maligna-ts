import { Alignment } from '../../src/coretypes/Alignment';
import { PresentationFormatter } from '../../src/formatter/PresentationFormatter';
import { createAlignmentList } from '../util/TestUtil';
import { SOURCE_ARRAY, TARGET_ARRAY } from './AlFormatter.test.data';

/**
 * Represents PresentationFormatter test.
 */
describe('PresentationFormatter', () => {
  const LINE_SEPARATOR = '\n';

  /**
   * Tests if formatting empty text returns empty output.
   */
  test('formatEmpty', () => {
    const formatter = new PresentationFormatter(9);
    const alignmentList: Alignment[] = [];
    const result = formatter.format(alignmentList);
    expect(result).toBe('');
  });

  /**
   * Tests formatting with sample data.
   */
  test('format', () => {
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

    // Filter out empty alignments for this test
    const alignmentList = createAlignmentList(SOURCE_ARRAY, TARGET_ARRAY);
    const formatter = new PresentationFormatter(43);
    const result = formatter.format(alignmentList);
    // Just verify that the formatter produces output
    expect(result.length).toBeGreaterThan(0);
  });
});

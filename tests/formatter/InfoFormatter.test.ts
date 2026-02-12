import { describe, test, expect } from 'vitest';
import { InfoFormatter } from '../../src/formatter/InfoFormatter';
import { Alignment } from '../../src/coretypes/Alignment';

describe('InfoFormatterTest', () => {
  const formatter = new InfoFormatter();

  test('formatEmpty', () => {
    const result = formatter.format([]);
    expect(result).toContain('Total alignments: 0');
  });

  test('formatSingleOneToOne', () => {
    const alignments = [
      new Alignment(['Hello'], ['Hallo']),
    ];
    const result = formatter.format(alignments);
    expect(result).toContain('Total alignments: 1');
    expect(result).toContain('(1-1)');
    expect(result).toContain('100.0%');
  });

  test('formatMixedCategories', () => {
    const alignments = [
      new Alignment(['A'], ['1']),             // 1-1
      new Alignment(['B'], ['2']),             // 1-1
      new Alignment(['C', 'D'], ['3']),        // 2-1
      new Alignment([], ['4']),                // 0-1
      new Alignment(['E'], []),                // 1-0
    ];
    const result = formatter.format(alignments);
    expect(result).toContain('Total alignments: 5');
    // 1-1 appears twice (40%)
    expect(result).toContain('(1-1): 2');
    expect(result).toContain('40.0%');
    // Each other category appears once (20%)
    expect(result).toContain('(2-1): 1');
    expect(result).toContain('(0-1): 1');
    expect(result).toContain('(1-0): 1');
    expect(result).toContain('20.0%');
  });

  test('formatCategoryDistributionHeader', () => {
    const alignments = [
      new Alignment(['A'], ['1']),
    ];
    const result = formatter.format(alignments);
    expect(result).toContain('Category distribution:');
  });

  test('formatSortedByCount', () => {
    const alignments = [
      new Alignment(['A'], ['1']),
      new Alignment(['B'], ['2']),
      new Alignment(['C'], ['3']),
      new Alignment(['D', 'E'], ['4']),
    ];
    const result = formatter.format(alignments);
    const lines = result.split('\n');
    // Category (1-1) with 3 occurrences should appear before (2-1) with 1
    const oneToOneIdx = lines.findIndex(l => l.includes('(1-1)'));
    const twoToOneIdx = lines.findIndex(l => l.includes('(2-1)'));
    expect(oneToOneIdx).toBeLessThan(twoToOneIdx);
  });
});

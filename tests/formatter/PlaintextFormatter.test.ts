import { describe, test, expect } from 'vitest';
import { PlaintextFormatter } from '../../src/formatter/PlaintextFormatter';
import { Alignment } from '../../src/coretypes/Alignment';

describe('PlaintextFormatterTest', () => {
  const formatter = new PlaintextFormatter();

  test('formatEmpty', () => {
    const result = formatter.format([]);
    expect(result).toBe('');
  });

  test('formatSingleAlignment', () => {
    const alignments = [
      new Alignment(['Hello world'], ['Hallo Welt']),
    ];
    const result = formatter.format(alignments);
    expect(result).toBe('Hello world\tHallo Welt');
  });

  test('formatMultipleAlignments', () => {
    const alignments = [
      new Alignment(['First'], ['Erste']),
      new Alignment(['Second'], ['Zweite']),
    ];
    const result = formatter.format(alignments);
    expect(result).toBe('First\tErste\nSecond\tZweite');
  });

  test('formatMultiSegmentAlignment', () => {
    // Multiple segments joined with space
    const alignments = [
      new Alignment(['First sentence.', 'Second sentence.'], ['Erster Satz.']),
    ];
    const result = formatter.format(alignments);
    expect(result).toBe('First sentence. Second sentence.\tErster Satz.');
  });

  test('formatEmptySegments', () => {
    const alignments = [
      new Alignment([], ['Orphan']),
    ];
    const result = formatter.format(alignments);
    expect(result).toBe('\tOrphan');
  });

  test('formatSeparateEmpty', () => {
    const result = formatter.formatSeparate([]);
    expect(result.source).toBe('\n');
    expect(result.target).toBe('\n');
  });

  test('formatSeparateSingle', () => {
    const alignments = [
      new Alignment(['Hello'], ['Hallo']),
    ];
    const result = formatter.formatSeparate(alignments);
    expect(result.source).toBe('Hello\n');
    expect(result.target).toBe('Hallo\n');
  });

  test('formatSeparateMultiple', () => {
    const alignments = [
      new Alignment(['First'], ['Erste']),
      new Alignment(['Second'], ['Zweite']),
    ];
    const result = formatter.formatSeparate(alignments);
    expect(result.source).toBe('First\nSecond\n');
    expect(result.target).toBe('Erste\nZweite\n');
  });
});

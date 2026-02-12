import { describe, test, expect } from 'vitest';
import { HtmlFormatter } from '../../src/formatter/HtmlFormatter';
import { Alignment } from '../../src/coretypes/Alignment';

describe('HtmlFormatterTest', () => {
  const formatter = new HtmlFormatter();

  test('formatEmpty', () => {
    const result = formatter.format([]);
    expect(result).toContain('<html>');
    expect(result).toContain('</html>');
    expect(result).toContain('<table>');
    expect(result).toContain('</table>');
    // No data rows
    expect(result).not.toContain('<td>');
  });

  test('formatSingleAlignment', () => {
    const alignments = [
      new Alignment(['Hello world'], ['Hallo Welt']),
    ];
    const result = formatter.format(alignments);
    expect(result).toContain('<td>Hello world</td>');
    expect(result).toContain('<td>Hallo Welt</td>');
    expect(result).toContain('<tr><th>Source</th><th>Target</th></tr>');
  });

  test('formatMultipleAlignments', () => {
    const alignments = [
      new Alignment(['First'], ['Erste']),
      new Alignment(['Second'], ['Zweite']),
      new Alignment(['Third'], ['Dritte']),
    ];
    const result = formatter.format(alignments);
    expect(result).toContain('<td>First</td>');
    expect(result).toContain('<td>Zweite</td>');
    expect(result).toContain('<td>Third</td>');
    // Count data rows (not header)
    const dataRows = (result.match(/<tr><td>/g) || []).length;
    expect(dataRows).toBe(3);
  });

  test('formatEscapesHtmlCharacters', () => {
    const alignments = [
      new Alignment(['<script>alert("xss")</script>'], ['A & B > C']),
    ];
    const result = formatter.format(alignments);
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&quot;xss&quot;');
    expect(result).toContain('A &amp; B &gt; C');
    // Should NOT contain raw HTML entities
    expect(result).not.toContain('<script>');
  });

  test('formatMultiSegmentAlignment', () => {
    // Multiple source segments are joined with space
    const alignments = [
      new Alignment(['First sentence.', 'Second sentence.'], ['Erster Satz.']),
    ];
    const result = formatter.format(alignments);
    expect(result).toContain('<td>First sentence. Second sentence.</td>');
  });

  test('formatEmptySegments', () => {
    // Empty source/target alignment
    const alignments = [
      new Alignment([], ['Orphan target']),
    ];
    const result = formatter.format(alignments);
    expect(result).toContain('<td></td>');
    expect(result).toContain('<td>Orphan target</td>');
  });
});

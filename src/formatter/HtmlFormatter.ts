import { Alignment } from '../core/Alignment.js';
import { Formatter } from './Formatter.js';

/**
 * Formatter that generates an HTML presentation of alignments.
 */
export class HtmlFormatter implements Formatter {
  format(alignmentList: Alignment[]): string {
    const lines: string[] = [];
    lines.push('<!DOCTYPE html>');
    lines.push('<html>');
    lines.push('<head>');
    lines.push('  <meta charset="UTF-8">');
    lines.push('  <title>Alignment Results</title>');
    lines.push('  <style>');
    lines.push('    body { font-family: Arial, sans-serif; margin: 20px; }');
    lines.push('    table { border-collapse: collapse; width: 100%; }');
    lines.push('    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
    lines.push('    th { background-color: #4CAF50; color: white; }');
    lines.push('    tr:nth-child(even) { background-color: #f2f2f2; }');
    lines.push('    .source { color: #2196F3; }');
    lines.push('    .target { color: #FF5722; }');
    lines.push('    .score { font-size: 0.8em; color: #666; }');
    lines.push('  </style>');
    lines.push('</head>');
    lines.push('<body>');
    lines.push('  <h1>Alignment Results</h1>');
    lines.push(`  <p>Total alignments: ${alignmentList.length}</p>`);
    lines.push('  <table>');
    lines.push('    <tr><th>#</th><th>Category</th><th>Source</th><th>Target</th><th>Score</th></tr>');

    let index = 1;
    for (const alignment of alignmentList) {
      const category = alignment.getCategory();
      const sourceText = alignment
        .getSourceSegmentList()
        .map((s) => this.escapeHtml(s))
        .join('<br>');
      const targetText = alignment
        .getTargetSegmentList()
        .map((s) => this.escapeHtml(s))
        .join('<br>');

      lines.push('    <tr>');
      lines.push(`      <td>${index}</td>`);
      lines.push(`      <td>${category.toString()}</td>`);
      lines.push(`      <td class="source">${sourceText || '<em>(empty)</em>'}</td>`);
      lines.push(`      <td class="target">${targetText || '<em>(empty)</em>'}</td>`);
      lines.push(`      <td class="score">${alignment.score.toFixed(4)}</td>`);
      lines.push('    </tr>');

      index++;
    }

    lines.push('  </table>');
    lines.push('</body>');
    lines.push('</html>');

    return lines.join('\n');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

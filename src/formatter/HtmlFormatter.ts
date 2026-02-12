import { Formatter } from './Formatter';
import { Alignment } from '../coretypes/Alignment';

/**
 * HTML table formatter.
 */
export class HtmlFormatter implements Formatter {
  format(alignmentList: Alignment[]): string {
    const lines: string[] = [];
    lines.push('<!DOCTYPE html>');
    lines.push('<html><head><meta charset="UTF-8"><style>');
    lines.push('table { border-collapse: collapse; width: 100%; }');
    lines.push('td, th { border: 1px solid #ccc; padding: 4px; vertical-align: top; }');
    lines.push('</style></head><body>');
    lines.push('<table>');
    lines.push('<tr><th>Source</th><th>Target</th></tr>');

    for (const al of alignmentList) {
      const sourceHtml = this.escapeHtml(al.sourceSegmentList.join(' '));
      const targetHtml = this.escapeHtml(al.targetSegmentList.join(' '));
      lines.push(`<tr><td>${sourceHtml}</td><td>${targetHtml}</td></tr>`);
    }

    lines.push('</table>');
    lines.push('</body></html>');
    return lines.join('\n');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

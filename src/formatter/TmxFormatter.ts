import { Alignment } from '../core/Alignment.js';
import { Formatter } from './Formatter.js';

/**
 * Formatter for TMX (Translation Memory eXchange) format.
 */
export class TmxFormatter implements Formatter {
  private readonly sourceLang: string;
  private readonly targetLang: string;

  constructor(sourceLang: string = 'en', targetLang: string = 'pl') {
    this.sourceLang = sourceLang;
    this.targetLang = targetLang;
  }

  format(alignmentList: Alignment[]): string {
    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<tmx version="1.4">');
    lines.push('  <header creationtool="maligna" creationtoolversion="3.0" ');
    lines.push(`    srclang="${this.escapeXml(this.sourceLang)}" >`);
    lines.push('  </header>');
    lines.push('  <body>');

    for (const alignment of alignmentList) {
      const sourceText = alignment.getSourceSegmentList().join(' ');
      const targetText = alignment.getTargetSegmentList().join(' ');

      lines.push('    <tu>');
      lines.push(
        `      <tuv xml:lang="${this.escapeXml(this.sourceLang)}"><seg>${this.escapeXml(sourceText)}</seg></tuv>`
      );
      lines.push(
        `      <tuv xml:lang="${this.escapeXml(this.targetLang)}"><seg>${this.escapeXml(targetText)}</seg></tuv>`
      );
      lines.push('    </tu>');
    }

    lines.push('  </body>');
    lines.push('</tmx>');

    return lines.join('\n');
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

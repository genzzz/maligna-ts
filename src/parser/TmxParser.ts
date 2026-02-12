import { Parser } from './Parser';
import { Alignment } from '../coretypes/Alignment';
import { parseTmx } from '../util/bind/tmx-xml';

/**
 * Parser for TMX XML format.
 */
export class TmxParser implements Parser {
  private content: string;
  private sourceLanguage: string;
  private targetLanguage: string;

  constructor(content: string, sourceLanguage: string, targetLanguage: string) {
    this.content = content;
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
  }

  parse(): Alignment[] {
    return parseTmx(this.content, this.sourceLanguage, this.targetLanguage);
  }
}

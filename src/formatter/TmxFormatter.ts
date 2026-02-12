import { Formatter } from './Formatter';
import { Alignment } from '../coretypes/Alignment';
import { formatTmx } from '../util/bind/tmx-xml';

/**
 * Formats alignments as TMX XML.
 */
export class TmxFormatter implements Formatter {
  private sourceLanguage: string;
  private targetLanguage: string;

  constructor(sourceLanguage: string, targetLanguage: string) {
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
  }

  format(alignmentList: Alignment[]): string {
    return formatTmx(alignmentList, this.sourceLanguage, this.targetLanguage);
  }
}

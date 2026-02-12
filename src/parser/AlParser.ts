import { Parser } from './Parser';
import { Alignment } from '../coretypes/Alignment';
import { parseAl } from '../util/bind/al-xml';

/**
 * Parser for .al XML format.
 */
export class AlParser implements Parser {
  private content: string;

  constructor(content: string) {
    this.content = content;
  }

  parse(): Alignment[] {
    return parseAl(this.content);
  }
}

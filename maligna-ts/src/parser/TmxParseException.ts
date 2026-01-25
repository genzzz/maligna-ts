/**
 * Exception thrown when parsing TMX documents fails.
 */
export class TmxParseException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TmxParseException';
  }
}

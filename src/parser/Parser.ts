import { Alignment } from '../core/Alignment.js';

/**
 * Represents input text(s) parser that creates alignment list.
 */
export interface Parser {
  /**
   * Parses input document into an alignment list.
   */
  parse(): Alignment[];
}

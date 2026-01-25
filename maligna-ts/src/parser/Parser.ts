import { Alignment } from '../coretypes/index.js';

/**
 * Represents input text(s) parser that creates alignment list.
 * Input file or files are configured in constructor of a concrete parser
 * implementation.
 */
export interface Parser {
  /**
   * Parses input document into an alignment list.
   * @returns parsed alignment list
   */
  parse(): Alignment[];
}

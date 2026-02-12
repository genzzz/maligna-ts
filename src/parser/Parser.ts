import { Alignment } from '../coretypes/Alignment';

/**
 * Parser interface — parses input into alignment list.
 */
export interface Parser {
  parse(): Alignment[];
}

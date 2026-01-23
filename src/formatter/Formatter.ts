import { Alignment } from '../core/Alignment.js';

/**
 * Represents alignment list formatter / writer.
 * Responsible for formatting alignment list to a specific format.
 */
export interface Formatter {
  /**
   * Formats alignment list to string.
   */
  format(alignmentList: Alignment[]): string;
}

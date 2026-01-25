import { Alignment } from '../coretypes/index.js';

/**
 * Represents an alignment list formatter / writer.
 * Responsible for writing alignment list in specific format.
 * The output location (file, set of files) are defined in individual subclasses
 * and should be configured in class constructor.
 */
export interface Formatter {
  /**
   * Formats alignment list and returns the formatted output.
   * @param alignmentList alignment list
   * @returns formatted string output
   */
  format(alignmentList: Alignment[]): string;
}

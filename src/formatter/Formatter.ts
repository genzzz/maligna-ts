import { Alignment } from '../coretypes/Alignment';

/**
 * Formatter interface — formats alignment list to output.
 */
export interface Formatter {
  format(alignmentList: Alignment[]): string;
}

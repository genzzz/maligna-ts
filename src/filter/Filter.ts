import { Alignment } from '../coretypes/Alignment';

/**
 * Filter interface — transforms a list of alignments.
 * Forms the core of the pipeline architecture.
 */
export interface Filter {
  apply(alignmentList: Alignment[]): Alignment[];
}

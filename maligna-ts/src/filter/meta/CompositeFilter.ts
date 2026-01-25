import { Alignment } from '../../coretypes/index.js';
import { Filter } from '../Filter.js';

/**
 * Represents a pipeline consisting of many filters but behaving as single
 * filter.
 * Transforms the input by executing all filters in sequence.
 * Basically implements composite design pattern.
 */
export class CompositeFilter implements Filter {
  private filterList: Filter[];

  /**
   * Creates composite filter.
   * @param filterList filter list; filters will be applied in the same order
   *        as they appear on this list
   */
  constructor(filterList: Filter[]) {
    this.filterList = filterList;
  }

  /**
   * Applies the composite filter by executing all the configured filters
   * in sequence, where output of previous filter is input of the next
   * filter.
   * @param alignmentList input alignment list
   * @returns transformed alignment list
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    for (const filter of this.filterList) {
      alignmentList = filter.apply(alignmentList);
    }
    return alignmentList;
  }
}

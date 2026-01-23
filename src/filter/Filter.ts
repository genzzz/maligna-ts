import { Alignment } from '../core/Alignment.js';

/**
 * Represents alignment list filter (in the sense of UNIX filter).
 * Allows to perform any operation on alignment list - for example
 * modify segment contents, join or split alignments, etc.
 *
 * Filter operation receives alignment list as a parameter and returns
 * modified alignment list. Filters can be connected together creating
 * an operation pipeline.
 */
export interface Filter {
  /**
   * Performs any transformation on alignment list.
   * @param alignmentList input alignment list
   * @returns output alignment list
   */
  apply(alignmentList: Alignment[]): Alignment[];
}

/**
 * Composite filter that applies multiple filters in sequence.
 */
export class CompositeFilter implements Filter {
  private readonly filters: Filter[];

  constructor(filters: Filter[]) {
    this.filters = [...filters];
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    let result = alignmentList;
    for (const filter of this.filters) {
      result = filter.apply(result);
    }
    return result;
  }
}

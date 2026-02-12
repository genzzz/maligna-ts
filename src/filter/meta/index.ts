import { Filter } from '../Filter';
import { Alignment } from '../../coretypes/Alignment';

/**
 * Composite filter — applies a sequence of filters in order.
 */
export class CompositeFilter implements Filter {
  private filters: Filter[];

  constructor(filters: Filter[]) {
    this.filters = filters;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    let result = alignmentList;
    for (const filter of this.filters) {
      result = filter.apply(result);
    }
    return result;
  }
}

/**
 * Decorator that skips alignments with score === -Infinity
 * (human-verified segments) and applies the inner filter only to the rest.
 */
export class IgnoreInfiniteProbabilityAlignmentsFilterDecorator implements Filter {
  private innerFilter: Filter;

  constructor(innerFilter: Filter) {
    this.innerFilter = innerFilter;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    const result: Alignment[] = [];
    const current: Alignment[] = [];

    for (const al of alignmentList) {
      if (al.score === -Infinity) {
        result.push(...this.innerFilter.apply(current));
        current.length = 0;
        result.push(al);
      } else {
        current.push(al);
      }
    }

    result.push(...this.innerFilter.apply(current));
    return result;
  }
}

/**
 * Wraps a filter with the IgnoreInfiniteProbabilityAlignments decorator.
 */
export function decorateFilter(filter: Filter): Filter {
  return new IgnoreInfiniteProbabilityAlignmentsFilterDecorator(filter);
}

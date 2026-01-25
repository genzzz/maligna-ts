import { Alignment } from '../../coretypes/index.js';
import { Filter } from '../Filter.js';

/**
 * Represents a macro filter which consists of multiple filtering operations
 * (for example complete alignment using Moore's algorithm).
 * Created to simplify complex operations and improve the performance.
 */
export interface Macro extends Filter {
  apply(alignmentList: Alignment[]): Alignment[];
}

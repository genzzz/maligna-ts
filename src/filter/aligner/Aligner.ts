import { Filter } from '../Filter';
import { Alignment } from '../../coretypes/Alignment';
import { AlignAlgorithm } from './align/AlignAlgorithm';

/**
 * Aligner filter — applies an alignment algorithm to each input alignment.
 * Each alignment's source and target segments are fed to the algorithm
 * which produces a list of sub-alignments.
 */
export class Aligner implements Filter {
  private algorithm: AlignAlgorithm;

  constructor(algorithm: AlignAlgorithm) {
    this.algorithm = algorithm;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    const result: Alignment[] = [];
    for (const alignment of alignmentList) {
      if (alignment.score === -Infinity) {
        // Preserve human-verified alignments
        result.push(alignment);
      } else {
        const subAlignments = this.algorithm.align(
          alignment.sourceSegmentList,
          alignment.targetSegmentList
        );
        result.push(...subAlignments);
      }
    }
    return result;
  }
}

import { Filter } from '../Filter';
import { Alignment } from '../../coretypes/Alignment';
import { toProbability } from '../../util/util';

/**
 * Selects only one-to-one alignments.
 */
export class OneToOneSelector implements Filter {
  apply(alignmentList: Alignment[]): Alignment[] {
    return alignmentList.filter(
      (al) =>
        al.sourceSegmentList.length === 1 && al.targetSegmentList.length === 1
    );
  }
}

/**
 * Selects the top fraction of alignments by score (best first).
 */
export class FractionSelector implements Filter {
  private fraction: number;

  constructor(fraction: number) {
    this.fraction = fraction;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    if (alignmentList.length === 0) {
      return [];
    }

    // Sort by score ascending (lower score = better) to compute a threshold.
    const scores = alignmentList.map((al) => al.score).sort((a, b) => a - b);
    const firstFiltered = this.fraction * scores.length - 0.5;
    const threshold =
      firstFiltered < 0 ? -Infinity : scores[Math.floor(firstFiltered)];

    // Return in original order, including all items at the threshold.
    return alignmentList.filter((al) => al.score <= threshold);
  }
}

/**
 * Selects alignments with probability above a threshold.
 */
export class ProbabilitySelector implements Filter {
  private probabilityThreshold: number;

  constructor(probability: number) {
    this.probabilityThreshold = probability;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    return alignmentList.filter((al) => {
      const prob = toProbability(al.score);
      return prob >= this.probabilityThreshold;
    });
  }
}

/**
 * Selects alignments that also appear in a reference alignment list.
 */
export class IntersectionSelector implements Filter {
  private referenceSet: Set<string>;

  constructor(referenceAlignmentList: Alignment[]) {
    this.referenceSet = new Set();
    for (const al of referenceAlignmentList) {
      this.referenceSet.add(this.makeKey(al));
    }
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    return alignmentList.filter((al) => this.referenceSet.has(this.makeKey(al)));
  }

  private makeKey(al: Alignment): string {
    return JSON.stringify({
      s: al.sourceSegmentList,
      t: al.targetSegmentList,
    });
  }
}

/**
 * Selects alignments that do NOT appear in a reference alignment list.
 */
export class DifferenceSelector implements Filter {
  private referenceSet: Set<string>;

  constructor(referenceAlignmentList: Alignment[]) {
    this.referenceSet = new Set();
    for (const al of referenceAlignmentList) {
      this.referenceSet.add(this.makeKey(al));
    }
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    return alignmentList.filter((al) => !this.referenceSet.has(this.makeKey(al)));
  }

  private makeKey(al: Alignment): string {
    return JSON.stringify({
      s: al.sourceSegmentList,
      t: al.targetSegmentList,
    });
  }
}

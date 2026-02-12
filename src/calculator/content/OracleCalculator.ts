import { Calculator } from '../Calculator';
import { Alignment } from '../../coretypes/Alignment';
import { toScore } from '../../util/util';

/**
 * Oracle calculator — uses a reference alignment to give perfect scores.
 * If source+target segments match reference, returns success score.
 */
export class OracleCalculator implements Calculator {
  static readonly DEFAULT_SUCCESS_SCORE = toScore(0.99);

  private alignmentMap: Map<string, number>;

  constructor(oracleAlignmentList: Alignment[]) {
    this.alignmentMap = new Map();
    for (const al of oracleAlignmentList) {
      const key = this.makeKey(al.sourceSegmentList, al.targetSegmentList);
      this.alignmentMap.set(key, al.score);
    }
  }

  calculateScore(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): number {
    const key = this.makeKey(sourceSegmentList, targetSegmentList);
    if (this.alignmentMap.has(key)) {
      return OracleCalculator.DEFAULT_SUCCESS_SCORE;
    }
    return Infinity;
  }

  private makeKey(source: string[], target: string[]): string {
    return JSON.stringify({ s: source, t: target });
  }
}

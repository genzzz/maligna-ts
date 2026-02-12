import { Filter } from '../Filter';
import { Alignment } from '../../coretypes/Alignment';
import { ModifyAlgorithm } from './modify/ModifyAlgorithm';

/**
 * Modifier filter — applies modify algorithms to source and target segments independently.
 */
export class Modifier implements Filter {
  private sourceAlgorithm: ModifyAlgorithm;
  private targetAlgorithm: ModifyAlgorithm;

  constructor(sourceAlgorithm: ModifyAlgorithm, targetAlgorithm: ModifyAlgorithm) {
    this.sourceAlgorithm = sourceAlgorithm;
    this.targetAlgorithm = targetAlgorithm;
  }

  apply(alignmentList: Alignment[]): Alignment[] {
    const result: Alignment[] = [];
    for (const alignment of alignmentList) {
      const newSource = this.sourceAlgorithm.modify(alignment.sourceSegmentList);
      const newTarget = this.targetAlgorithm.modify(alignment.targetSegmentList);
      result.push(new Alignment(newSource, newTarget, alignment.score));
    }
    return result;
  }
}

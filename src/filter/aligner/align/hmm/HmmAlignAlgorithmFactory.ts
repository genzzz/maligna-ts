import type { Calculator } from '../../../../calculator/Calculator';
import type { AlignAlgorithm } from '../AlignAlgorithm';
import type { BandMatrixFactory } from '../../../../matrix/BandMatrix';
import { ViterbiAlgorithm } from './viterbi/ViterbiAlgorithm';
import { ForwardBackwardAlgorithm } from './fb/ForwardBackwardAlgorithm';

/**
 * Factory interface for creating HMM alignment algorithms.
 */
export interface HmmAlignAlgorithmFactory {
  createAlgorithm(
    calculator: Calculator,
    categoryMap: Map<string, number>,
    matrixFactory: BandMatrixFactory<any>
  ): AlignAlgorithm;
}

/**
 * Factory for creating ViterbiAlgorithm instances.
 */
export class ViterbiAlgorithmFactory implements HmmAlignAlgorithmFactory {
  createAlgorithm(
    calculator: Calculator,
    categoryMap: Map<string, number>,
    matrixFactory: BandMatrixFactory<any>
  ): AlignAlgorithm {
    return new ViterbiAlgorithm(calculator, categoryMap, matrixFactory);
  }
}

/**
 * Factory for creating ForwardBackwardAlgorithm instances.
 */
export class ForwardBackwardAlgorithmFactory implements HmmAlignAlgorithmFactory {
  createAlgorithm(
    calculator: Calculator,
    categoryMap: Map<string, number>,
    matrixFactory: BandMatrixFactory<any>
  ): AlignAlgorithm {
    return new ForwardBackwardAlgorithm(calculator, categoryMap, matrixFactory);
  }
}

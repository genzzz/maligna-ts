import { HmmAlignAlgorithmFactory } from './HmmAlignAlgorithmFactory.js';
import { ViterbiAlgorithm } from './viterbi/ViterbiAlgorithm.js';
import { AlignAlgorithm } from '../AlignAlgorithm.js';
import { Calculator } from '../../../../calculator/Calculator.js';
import { CategoryMap } from '../../../../coretypes/CategoryDefaults.js';
import { MatrixFactory } from '../../../../matrix/MatrixFactory.js';

/**
 * Factory for creating ViterbiAlgorithm instances.
 */
export class ViterbiAlgorithmFactory implements HmmAlignAlgorithmFactory {
  createAlignAlgorithm(
    calculator: Calculator,
    categoryMap: CategoryMap,
    matrixFactory: MatrixFactory
  ): AlignAlgorithm {
    return new ViterbiAlgorithm(calculator, categoryMap, matrixFactory);
  }
}

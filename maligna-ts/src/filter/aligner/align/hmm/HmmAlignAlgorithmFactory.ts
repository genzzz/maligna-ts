import { AlignAlgorithm } from '../AlignAlgorithm.js';
import { Calculator } from '../../../../calculator/Calculator.js';
import { CategoryMap } from '../../../../coretypes/CategoryDefaults.js';
import { MatrixFactory } from '../../../../matrix/MatrixFactory.js';

/**
 * Represents a factory producing align algorithms based on Hidden Markov
 * Models (HMM). Used by AdaptiveBandAlgorithm to be independent
 * of actual algorithm.
 */
export interface HmmAlignAlgorithmFactory {
  /**
   * Creates align algorithm.
   * @param calculator calculator
   * @param categoryMap map of possible alignment categories
   * @param matrixFactory factory creating matrices to be used by algorithm
   * @returns align algorithm
   */
  createAlignAlgorithm(
    calculator: Calculator,
    categoryMap: CategoryMap,
    matrixFactory: MatrixFactory
  ): AlignAlgorithm;
}

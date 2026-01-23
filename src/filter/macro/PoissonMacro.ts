import { Alignment } from '../../core/Alignment.js';
import { BEST_CATEGORY_MAP } from '../../core/CategoryDefaults.js';
import { Calculator } from '../../calculator/Calculator.js';
import { PoissonDistributionCalculator } from '../../calculator/length/PoissonDistributionCalculator.js';
import { SplitCounter } from '../../calculator/length/Counter.js';
import { Filter } from '../Filter.js';
import { Aligner } from '../aligner/Aligner.js';
import { ViterbiAlgorithm } from '../aligner/ViterbiAlgorithm.js';
import { FullMatrixFactory } from '../../matrix/FullMatrix.js';

/**
 * Macro that performs alignment using Poisson distribution (length-based).
 * Similar to Gale and Church algorithm.
 */
export class PoissonMacro implements Filter {
  apply(alignmentList: Alignment[]): Alignment[] {
    const counter = new SplitCounter();
    const calculator: Calculator = new PoissonDistributionCalculator(
      counter,
      alignmentList
    );

    const algorithm = new ViterbiAlgorithm(
      calculator,
      BEST_CATEGORY_MAP,
      new FullMatrixFactory()
    );

    const aligner = new Aligner(algorithm);
    return aligner.apply(alignmentList);
  }
}

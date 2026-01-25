import { Alignment } from '../../coretypes/index.js';
import { Macro } from './Macro.js';
import { Calculator } from '../../calculator/index.js';
import { PoissonDistributionCalculator } from '../../calculator/length/PoissonDistributionCalculator.js';
import { SplitCounter } from '../../calculator/length/counter/SplitCounter.js';
import { ForwardBackwardAlgorithmFactory } from '../aligner/align/hmm/ForwardBackwardAlgorithmFactory.js';
import { AdaptiveBandAlgorithm } from '../aligner/align/hmm/adaptive/AdaptiveBandAlgorithm.js';
import { Aligner } from '../aligner/Aligner.js';

/**
 * Uses algorithm similar to Gale and Church,
 * but instead of normal distribution uses Poisson distribution and
 * measures length of sentence in words instead of characters as in original.
 * 
 * Seems to give better results than Gale and Church algorithm.
 */
export class PoissonMacro implements Macro {
  apply(alignmentList: Alignment[]): Alignment[] {
    const counter = new SplitCounter();
    const calculator: Calculator = new PoissonDistributionCalculator(counter, alignmentList);

    const algorithmFactory = new ForwardBackwardAlgorithmFactory();

    const algorithm = new AdaptiveBandAlgorithm(algorithmFactory, calculator);

    const filter = new Aligner(algorithm);

    return filter.apply(alignmentList);
  }
}

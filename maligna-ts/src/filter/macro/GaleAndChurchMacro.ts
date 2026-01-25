import { Alignment } from '../../coretypes/index.js';
import { Macro } from './Macro.js';
import { Calculator } from '../../calculator/index.js';
import { NormalDistributionCalculator } from '../../calculator/length/NormalDistributionCalculator.js';
import { CharCounter } from '../../calculator/length/counter/CharCounter.js';
import { ViterbiAlgorithmFactory } from '../aligner/align/hmm/ViterbiAlgorithmFactory.js';
import { AdaptiveBandAlgorithm } from '../aligner/align/hmm/adaptive/AdaptiveBandAlgorithm.js';
import { Aligner } from '../aligner/Aligner.js';

/**
 * Represents macro to align a text using Gale and Church algorithm.
 * Actual implementation can be slightly different but the result should be
 * very similar.
 * 
 * @see "A Program for Aligning Sentences in Bilingual Corpora,
 *       Gale, W.A., Church, K.W."
 */
export class GaleAndChurchMacro implements Macro {
  apply(alignmentList: Alignment[]): Alignment[] {
    const counter = new CharCounter();
    const calculator: Calculator = new NormalDistributionCalculator(counter);

    const algorithmFactory = new ViterbiAlgorithmFactory();

    const algorithm = new AdaptiveBandAlgorithm(algorithmFactory, calculator);

    const filter = new Aligner(algorithm);

    return filter.apply(alignmentList);
  }
}

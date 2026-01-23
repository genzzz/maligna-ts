import { Alignment } from '../../core/Alignment.js';
import { BEST_CATEGORY_MAP } from '../../core/CategoryDefaults.js';
import { Calculator } from '../../calculator/Calculator.js';
import { PoissonDistributionCalculator } from '../../calculator/length/PoissonDistributionCalculator.js';
import { TranslationCalculator } from '../../calculator/content/TranslationCalculator.js';
import { SplitCounter } from '../../calculator/length/Counter.js';
import { Filter } from '../Filter.js';
import { Aligner } from '../aligner/Aligner.js';
import { UnifyAligner } from '../aligner/UnifyAligner.js';
import { ViterbiAlgorithm } from '../aligner/ViterbiAlgorithm.js';
import { OneToOneSelector } from '../selector/OneToOneSelector.js';
import { FractionSelector } from '../selector/FractionSelector.js';
import { FullMatrixFactory } from '../../matrix/FullMatrix.js';

/**
 * Macro to align text using Moore's algorithm.
 *
 * Moore's algorithm:
 * 1. First aligns by sentence length (Gale and Church style)
 * 2. Selects best 1-1 alignments from the result
 * 3. Trains translation and language models on the best alignments
 * 4. Performs final alignment using translation-based scoring
 *
 * @see "Fast and Accurate Sentence Alignment of Bilingual Corpora, Robert C. Moore"
 */
export class MooreMacro implements Filter {
  static readonly SELECT_FRACTION = 0.85;

  apply(alignmentList: Alignment[]): Alignment[] {
    // Phase 1: Length-based alignment
    const lengthAlignmentList = this.lengthAlign(alignmentList);

    // Phase 2: Select best 1-1 alignments for training
    const bestAlignmentList = this.selectBestAlignments(lengthAlignmentList);

    if (bestAlignmentList.length === 0) {
      console.warn(
        'Content alignment is impossible because zero best alignments were selected. ' +
          'Returning result of length alignment only.'
      );
      return this.unifyAlignments(alignmentList, lengthAlignmentList);
    }

    // Phase 3: Content-based alignment using trained models
    const contentAlignmentList = this.contentAlign(
      alignmentList,
      bestAlignmentList
    );

    return this.unifyAlignments(alignmentList, contentAlignmentList);
  }

  /**
   * First phase - align by segment length.
   */
  private lengthAlign(alignmentList: Alignment[]): Alignment[] {
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

    const filter = new Aligner(algorithm);
    return filter.apply(alignmentList);
  }

  /**
   * Select best 1-1 alignments for training translation model.
   */
  private selectBestAlignments(alignmentList: Alignment[]): Alignment[] {
    const oneToOneSelector = new OneToOneSelector();
    const fractionSelector = new FractionSelector(MooreMacro.SELECT_FRACTION);

    let result = oneToOneSelector.apply(alignmentList);
    result = fractionSelector.apply(result);
    return result;
  }

  /**
   * Second phase - align using translation model.
   */
  private contentAlign(
    alignmentList: Alignment[],
    trainingAlignmentList: Alignment[]
  ): Alignment[] {
    const calculator: Calculator = new TranslationCalculator(
      trainingAlignmentList
    );

    const algorithm = new ViterbiAlgorithm(
      calculator,
      BEST_CATEGORY_MAP,
      new FullMatrixFactory()
    );

    const filter = new Aligner(algorithm);
    return filter.apply(alignmentList);
  }

  /**
   * Restore original segment contents after alignment.
   */
  private unifyAlignments(
    originalAlignmentList: Alignment[],
    alignedList: Alignment[]
  ): Alignment[] {
    const unifyAligner = new UnifyAligner(originalAlignmentList);
    return unifyAligner.apply(alignedList);
  }
}

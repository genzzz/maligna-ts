import { Alignment } from '../../coretypes/index.js';
import { Macro } from './Macro.js';
import { Filter } from '../Filter.js';
import { Calculator } from '../../calculator/index.js';
import { PoissonDistributionCalculator } from '../../calculator/length/PoissonDistributionCalculator.js';
import { TranslationCalculator } from '../../calculator/content/TranslationCalculator.js';
import { CompositeCalculator } from '../../calculator/meta/CompositeCalculator.js';
import { SplitCounter } from '../../calculator/length/counter/SplitCounter.js';
import { ForwardBackwardAlgorithmFactory } from '../aligner/align/hmm/ForwardBackwardAlgorithmFactory.js';
import { AdaptiveBandAlgorithm } from '../aligner/align/hmm/adaptive/AdaptiveBandAlgorithm.js';
import { Aligner } from '../aligner/Aligner.js';
import { UnifyAligner } from '../aligner/UnifyAligner.js';
import { Modifier } from '../modifier/Modifier.js';
import { UnifyRareWordsCleanAlgorithm } from '../modifier/modify/clean/UnifyRareWordsCleanAlgorithm.js';
import { WordSplitAlgorithm } from '../modifier/modify/split/WordSplitAlgorithm.js';
import { OneToOneSelector } from '../selector/OneToOneSelector.js';
import { FractionSelector } from '../selector/FractionSelector.js';
import { CompositeFilter } from '../meta/CompositeFilter.js';
import { Vocabulary } from '../../model/vocabulary/Vocabulary.js';
import { VocabularyUtil } from '../../model/vocabulary/VocabularyUtil.js';

/**
 * Represents macro to align a text using Moore's algorithm.
 * Actual implementation can be slightly different (for example does not
 * normalize scores, selects a fraction instead, or uses different distribution
 * because results seem to be better), but the result should be
 * very similar.
 * 
 * @see "Fast and Accurate Sentence Alignment of Bilingual
 *       Corpora, Robert C. Moore"
 */
export class MooreMacro implements Macro {
  static readonly SELECT_FRACTION = 0.85;

  /**
   * Performs the alignment:
   * 1. Removes rare words from the input
   * 2. Aligns by length and selects best alignments from the result
   * 3. Trains language and translation models based on initial alignment
   * 4. Performs actual alignment using the models
   * 5. Unifies initial alignment with resulting one to recover rare words
   */
  apply(alignmentList: Alignment[]): Alignment[] {
    const unifiedAlignmentList = this.unifyRareWords(alignmentList);

    const lengthAlignmentList = this.lengthAlign(unifiedAlignmentList);

    const bestAlignmentList = this.selectBestAlignments(lengthAlignmentList);

    if (bestAlignmentList.length === 0) {
      console.warn(
        'Content alignment is impossible because zero ' +
        'best alignments were selected from length alignment. ' +
        'Returning result of length alignment only.'
      );
      return this.unifyAlignments(alignmentList, lengthAlignmentList);
    }

    const contentAlignmentList = this.contentAlign(unifiedAlignmentList, bestAlignmentList);

    return this.unifyAlignments(alignmentList, contentAlignmentList);
  }

  /**
   * Changes rare words in the input to some predefined unknown
   * word. This improves alignment speed and reduces translation and language
   * models size.
   */
  private unifyRareWords(alignmentList: Alignment[]): Alignment[] {
    const splitAlgorithm = new WordSplitAlgorithm();

    const sourceVocabulary = new Vocabulary();
    const targetVocabulary = new Vocabulary();
    const sourceWidList: number[][] = [];
    const targetWidList: number[][] = [];

    VocabularyUtil.tokenize(
      splitAlgorithm,
      alignmentList,
      sourceVocabulary,
      targetVocabulary,
      sourceWidList,
      targetWidList
    );

    const truncatedSourceVocabulary = VocabularyUtil.createTruncatedVocabulary(
      sourceWidList,
      sourceVocabulary
    );
    const truncatedTargetVocabulary = VocabularyUtil.createTruncatedVocabulary(
      targetWidList,
      targetVocabulary
    );

    const sourceAlgorithm = new UnifyRareWordsCleanAlgorithm(truncatedSourceVocabulary);
    const targetAlgorithm = new UnifyRareWordsCleanAlgorithm(truncatedTargetVocabulary);

    const filter: Filter = new Modifier(sourceAlgorithm, targetAlgorithm);

    return filter.apply(alignmentList);
  }

  /**
   * First algorithm phase - align text by segment length (using similar
   * method to the one used in PoissonMacro).
   */
  private lengthAlign(alignmentList: Alignment[]): Alignment[] {
    const counter = new SplitCounter();
    const calculator: Calculator = new PoissonDistributionCalculator(counter, alignmentList);

    const algorithmFactory = new ForwardBackwardAlgorithmFactory();

    const algorithm = new AdaptiveBandAlgorithm(algorithmFactory, calculator);

    const filter: Filter = new Aligner(algorithm);

    return filter.apply(alignmentList);
  }

  /**
   * Selects only SELECT_FRACTION one-to-one alignments from the result.
   */
  private selectBestAlignments(alignmentList: Alignment[]): Alignment[] {
    const filterList: Filter[] = [
      new OneToOneSelector(),
      new FractionSelector(MooreMacro.SELECT_FRACTION),
    ];
    const filter: Filter = new CompositeFilter(filterList);
    return filter.apply(alignmentList);
  }

  /**
   * Second algorithm phase - align by segment contents. First trains
   * translation model and language models using alignment obtained in first
   * phase, and after that aligns by calculating translation probability.
   */
  private contentAlign(alignmentList: Alignment[], bestAlignmentList: Alignment[]): Alignment[] {
    const calculatorList: Calculator[] = [];

    const counter = new SplitCounter();
    calculatorList.push(new PoissonDistributionCalculator(counter, alignmentList));

    calculatorList.push(new TranslationCalculator(bestAlignmentList));

    const calculator: Calculator = new CompositeCalculator(calculatorList);

    const algorithmFactory = new ForwardBackwardAlgorithmFactory();

    const algorithm = new AdaptiveBandAlgorithm(algorithmFactory, calculator);

    const filter: Filter = new Aligner(algorithm);

    return filter.apply(alignmentList);
  }

  /**
   * Unifies alignments from alignment list with reference alignment list.
   */
  private unifyAlignments(
    alignmentList: Alignment[],
    referenceAlignmentList: Alignment[]
  ): Alignment[] {
    const filter: Filter = new UnifyAligner(referenceAlignmentList);
    return filter.apply(alignmentList);
  }
}

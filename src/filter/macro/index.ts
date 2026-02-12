import { Filter } from '../Filter';
import { Alignment } from '../../coretypes/Alignment';
import { Aligner } from '../aligner/Aligner';
import { UnifyAligner } from '../aligner/UnifyAligner';
import { AdaptiveBandAlgorithm } from '../aligner/align/hmm/adaptive/AdaptiveBandAlgorithm';
import { ViterbiAlgorithmFactory, ForwardBackwardAlgorithmFactory } from '../aligner/align/hmm/HmmAlignAlgorithmFactory';
import { NormalDistributionCalculator } from '../../calculator/length/NormalDistributionCalculator';
import { PoissonDistributionCalculator } from '../../calculator/length/PoissonDistributionCalculator';
import { TranslationCalculator } from '../../calculator/content/TranslationCalculator';
import { CompositeCalculator } from '../../calculator/meta';
import { CharCounter, SplitCounter } from '../../calculator/length/Counter';
import { BEST_CATEGORY_MAP, MOORE_CATEGORY_MAP } from '../../coretypes/CategoryDefaults';
import { OneToOneSelector, FractionSelector } from '../selector';
import { CompositeFilter, decorateFilter } from '../meta';
import { Modifier } from '../modifier/Modifier';
import { Vocabulary, tokenize, createTruncatedVocabulary, DEFAULT_TOKENIZE_ALGORITHM } from '../../model/vocabulary';
import { trainLanguageModel } from '../../model/language';
import { trainTranslationModel, DEFAULT_TRAIN_ITERATION_COUNT } from '../../model/translation';
import { UnifyRareWordsCleanAlgorithm } from '../modifier/modify/clean';

/**
 * Gale and Church macro — character length + normal distribution + Viterbi + adaptive band.
 */
export class GaleAndChurchMacro implements Filter {
  apply(alignmentList: Alignment[]): Alignment[] {
    const calculator = new NormalDistributionCalculator(new CharCounter());
    const algorithm = new AdaptiveBandAlgorithm(
      new ViterbiAlgorithmFactory(),
      calculator,
      AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
      AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
      AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
      BEST_CATEGORY_MAP
    );
    const aligner = new Aligner(algorithm);
    return decorateFilter(aligner).apply(alignmentList);
  }
}

/**
 * Poisson macro — word count + Poisson distribution + Forward-Backward + adaptive band.
 */
export class PoissonMacro implements Filter {
  apply(alignmentList: Alignment[]): Alignment[] {
    const calculator = new PoissonDistributionCalculator(
      new SplitCounter(),
      alignmentList
    );
    const algorithm = new AdaptiveBandAlgorithm(
      new ForwardBackwardAlgorithmFactory(),
      calculator,
      AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
      AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
      AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
      BEST_CATEGORY_MAP
    );
    const aligner = new Aligner(algorithm);
    return decorateFilter(aligner).apply(alignmentList);
  }
}

/**
 * Moore's algorithm macro.
 *
 * Steps:
 * 1. Unify rare words
 * 2. Length-based alignment (Poisson + FB + adaptive band)
 * 3. Select best (one-to-one + fraction 0.85)
 * 4. Content-based alignment (Poisson + Translation + FB + adaptive band)
 * 5. Unify alignments back to original structure
 */
export class MooreMacro implements Filter {
  private static readonly SELECT_FRACTION = 0.85;

  apply(alignmentList: Alignment[]): Alignment[] {
    // Step 1: Prepare vocabularies and unify rare words
    const sourceVocabulary = new Vocabulary();
    const targetVocabulary = new Vocabulary();
    const sourceWidList: number[][] = [];
    const targetWidList: number[][] = [];

    tokenize(
      DEFAULT_TOKENIZE_ALGORITHM,
      alignmentList,
      sourceVocabulary,
      targetVocabulary,
      sourceWidList,
      targetWidList
    );

    const truncatedSourceVocab = createTruncatedVocabulary(
      sourceWidList,
      sourceVocabulary
    );
    const truncatedTargetVocab = createTruncatedVocabulary(
      targetWidList,
      targetVocabulary
    );

    const sourceUnifier = new UnifyRareWordsCleanAlgorithm(truncatedSourceVocab);
    const targetUnifier = new UnifyRareWordsCleanAlgorithm(truncatedTargetVocab);
    const unifyModifier = new Modifier(sourceUnifier, targetUnifier);
    let modified = unifyModifier.apply(alignmentList);

    // Step 2: Length-based alignment
    const lengthCalculator = new PoissonDistributionCalculator(
      new SplitCounter(),
      modified
    );
    const lengthAlgorithm = new AdaptiveBandAlgorithm(
      new ForwardBackwardAlgorithmFactory(),
      lengthCalculator,
      AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
      AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
      AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
      MOORE_CATEGORY_MAP
    );
    const lengthAligner = new Aligner(lengthAlgorithm);
    let aligned = decorateFilter(lengthAligner).apply(modified);

    // Step 3: Select best
    const selector = new CompositeFilter([
      new OneToOneSelector(),
      new FractionSelector(MooreMacro.SELECT_FRACTION),
    ]);
    const selected = selector.apply(aligned);

    // Step 4: Train translation model and re-align
    const selSourceVocab = new Vocabulary();
    const selTargetVocab = new Vocabulary();
    const selSourceWidList: number[][] = [];
    const selTargetWidList: number[][] = [];

    tokenize(
      DEFAULT_TOKENIZE_ALGORITHM,
      selected,
      selSourceVocab,
      selTargetVocab,
      selSourceWidList,
      selTargetWidList
    );

    const sourceLanguageModel = trainLanguageModel(selSourceWidList);
    const targetLanguageModel = trainLanguageModel(selTargetWidList);
    const translationModel = trainTranslationModel(
      DEFAULT_TRAIN_ITERATION_COUNT,
      selSourceWidList,
      selTargetWidList
    );

    const translationCalculator = new TranslationCalculator(
      selSourceVocab,
      selTargetVocab,
      sourceLanguageModel,
      targetLanguageModel,
      translationModel,
      DEFAULT_TOKENIZE_ALGORITHM
    );

    const contentCalculator = new CompositeCalculator([
      lengthCalculator,
      translationCalculator,
    ]);

    const contentAlgorithm = new AdaptiveBandAlgorithm(
      new ForwardBackwardAlgorithmFactory(),
      contentCalculator,
      AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
      AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
      AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
      MOORE_CATEGORY_MAP
    );
    const contentAligner = new Aligner(contentAlgorithm);
    const contentAligned = decorateFilter(contentAligner).apply(modified);

    // Step 5: Unify back to original structure
    const unifyAligner = new UnifyAligner(contentAligned);
    return decorateFilter(unifyAligner).apply(alignmentList);
  }
}

/**
 * Translation macro — Normal + FB → select → Translation + FB.
 */
export class TranslationMacro implements Filter {
  private static readonly SELECT_FRACTION = 0.9;

  apply(alignmentList: Alignment[]): Alignment[] {
    // Step 1: Length-based alignment
    const lengthCalculator = new NormalDistributionCalculator(new CharCounter());
    const lengthAlgorithm = new AdaptiveBandAlgorithm(
      new ForwardBackwardAlgorithmFactory(),
      lengthCalculator,
      AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
      AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
      AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
      BEST_CATEGORY_MAP
    );
    const lengthAligner = new Aligner(lengthAlgorithm);
    let aligned = decorateFilter(lengthAligner).apply(alignmentList);

    // Step 2: Select best
    const selector = new CompositeFilter([
      new OneToOneSelector(),
      new FractionSelector(TranslationMacro.SELECT_FRACTION),
    ]);
    const selected = selector.apply(aligned);

    // Step 3: Train translation model
    const sourceVocab = new Vocabulary();
    const targetVocab = new Vocabulary();
    const sourceWidList: number[][] = [];
    const targetWidList: number[][] = [];

    tokenize(
      DEFAULT_TOKENIZE_ALGORITHM,
      selected,
      sourceVocab,
      targetVocab,
      sourceWidList,
      targetWidList
    );

    const sourceLanguageModel = trainLanguageModel(sourceWidList);
    const targetLanguageModel = trainLanguageModel(targetWidList);
    const translationModel = trainTranslationModel(
      DEFAULT_TRAIN_ITERATION_COUNT,
      sourceWidList,
      targetWidList
    );

    const translationCalculator = new TranslationCalculator(
      sourceVocab,
      targetVocab,
      sourceLanguageModel,
      targetLanguageModel,
      translationModel,
      DEFAULT_TOKENIZE_ALGORITHM
    );

    // Step 4: Re-align with translation
    const contentAlgorithm = new AdaptiveBandAlgorithm(
      new ForwardBackwardAlgorithmFactory(),
      translationCalculator,
      AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
      AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
      AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
      BEST_CATEGORY_MAP
    );
    const contentAligner = new Aligner(contentAlgorithm);
    return decorateFilter(contentAligner).apply(alignmentList);
  }
}

/**
 * Poisson + Translation macro — Poisson + FB → select → Poisson + Translation composite + FB.
 */
export class PoissonTranslationMacro implements Filter {
  private static readonly SELECT_FRACTION = 0.9;

  apply(alignmentList: Alignment[]): Alignment[] {
    // Step 1: Poisson-based alignment
    const poissonCalculator = new PoissonDistributionCalculator(
      new SplitCounter(),
      alignmentList
    );
    const poissonAlgorithm = new AdaptiveBandAlgorithm(
      new ForwardBackwardAlgorithmFactory(),
      poissonCalculator,
      AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
      AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
      AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
      BEST_CATEGORY_MAP
    );
    const poissonAligner = new Aligner(poissonAlgorithm);
    let aligned = decorateFilter(poissonAligner).apply(alignmentList);

    // Step 2: Select best
    const selector = new CompositeFilter([
      new OneToOneSelector(),
      new FractionSelector(PoissonTranslationMacro.SELECT_FRACTION),
    ]);
    const selected = selector.apply(aligned);

    // Step 3: Train translation model
    const sourceVocab = new Vocabulary();
    const targetVocab = new Vocabulary();
    const sourceWidList: number[][] = [];
    const targetWidList: number[][] = [];

    tokenize(
      DEFAULT_TOKENIZE_ALGORITHM,
      selected,
      sourceVocab,
      targetVocab,
      sourceWidList,
      targetWidList
    );

    const sourceLanguageModel = trainLanguageModel(sourceWidList);
    const targetLanguageModel = trainLanguageModel(targetWidList);
    const translationModel = trainTranslationModel(
      DEFAULT_TRAIN_ITERATION_COUNT,
      sourceWidList,
      targetWidList
    );

    const translationCalculator = new TranslationCalculator(
      sourceVocab,
      targetVocab,
      sourceLanguageModel,
      targetLanguageModel,
      translationModel,
      DEFAULT_TOKENIZE_ALGORITHM
    );

    // Step 4: Composite calculator (Poisson + Translation)
    const compositeCalculator = new CompositeCalculator([
      poissonCalculator,
      translationCalculator,
    ]);

    const contentAlgorithm = new AdaptiveBandAlgorithm(
      new ForwardBackwardAlgorithmFactory(),
      compositeCalculator,
      AdaptiveBandAlgorithm.DEFAULT_INITIAL_BAND_RADIUS,
      AdaptiveBandAlgorithm.DEFAULT_BAND_INCREMENT_RATIO,
      AdaptiveBandAlgorithm.DEFAULT_MIN_BAND_MARGIN,
      BEST_CATEGORY_MAP
    );
    const contentAligner = new Aligner(contentAlgorithm);
    return decorateFilter(contentAligner).apply(alignmentList);
  }
}

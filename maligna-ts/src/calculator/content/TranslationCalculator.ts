import { Calculator } from '../Calculator.js';
import { Alignment } from '../../coretypes/Alignment.js';
import { Vocabulary } from '../../model/vocabulary/Vocabulary.js';
import {
  tokenizeAndBuildVocabulary,
  tokenize,
  DEFAULT_TOKENIZE_ALGORITHM,
} from '../../model/vocabulary/VocabularyUtil.js';
import { SplitAlgorithm } from '../../filter/modifier/modify/split/SplitAlgorithm.js';
import {
  LanguageModel,
  trainLanguageModel,
} from '../../model/language/LanguageModel.js';
import {
  TranslationModel,
  trainTranslationModel,
  DEFAULT_TRAIN_ITERATION_COUNT,
} from '../../model/translation/index.js';
import { toScore } from '../../util/Util.js';

/**
 * Represents calculator calculating probability of concatenation of target
 * segments being translation of concatenation of source segments.
 *
 * To do this uses given translation and language models or trains
 * them using the training utilities with given reference corpus.
 *
 * @see "Machine Translation: an Introductory Guide, D. Arnold, L. Balkan,
 *     S. Meijer, R. Lee Humphreys, L. Sadler"
 */
export class TranslationCalculator implements Calculator {
  public static readonly MINIMUM_TRANSLATION_PROBABILITY = 1e-38;

  private readonly sourceVocabulary: Vocabulary;
  private readonly targetVocabulary: Vocabulary;
  private readonly sourceLanguageModel: LanguageModel;
  private readonly targetLanguageModel: LanguageModel;
  private readonly translationModel: TranslationModel;
  private readonly splitAlgorithm: SplitAlgorithm;

  /**
   * Creates translation calculator with pre-built models.
   */
  constructor(
    sourceVocabulary: Vocabulary,
    targetVocabulary: Vocabulary,
    sourceLanguageModel: LanguageModel,
    targetLanguageModel: LanguageModel,
    translationModel: TranslationModel,
    splitAlgorithm?: SplitAlgorithm
  );

  /**
   * Creates translation calculator. Trains translation and language models
   * based on given reference alignment list.
   */
  constructor(
    alignmentList: readonly Alignment[],
    trainIterationCount?: number,
    splitAlgorithm?: SplitAlgorithm
  );

  constructor(
    arg1: Vocabulary | readonly Alignment[],
    arg2?: Vocabulary | number,
    arg3?: LanguageModel | SplitAlgorithm,
    arg4?: LanguageModel,
    arg5?: TranslationModel,
    arg6?: SplitAlgorithm
  ) {
    if (arg1 instanceof Vocabulary) {
      // Constructor with pre-built models
      this.sourceVocabulary = arg1;
      this.targetVocabulary = arg2 as Vocabulary;
      this.sourceLanguageModel = arg3 as LanguageModel;
      this.targetLanguageModel = arg4 as LanguageModel;
      this.translationModel = arg5 as TranslationModel;
      this.splitAlgorithm = arg6 ?? DEFAULT_TOKENIZE_ALGORITHM;
    } else {
      // Constructor that trains from alignment list
      const alignmentList = arg1;
      const trainIterationCount =
        (arg2 as number | undefined) ?? DEFAULT_TRAIN_ITERATION_COUNT;
      this.splitAlgorithm =
        (arg3 as SplitAlgorithm | undefined) ?? DEFAULT_TOKENIZE_ALGORITHM;

      if (alignmentList.length === 0) {
        throw new Error('Reference corpus cannot be empty');
      }

      this.sourceVocabulary = new Vocabulary();
      this.targetVocabulary = new Vocabulary();
      const sourceWidList: number[][] = [];
      const targetWidList: number[][] = [];

      tokenizeAndBuildVocabulary(
        this.splitAlgorithm,
        alignmentList,
        this.sourceVocabulary,
        this.targetVocabulary,
        sourceWidList,
        targetWidList
      );

      this.sourceLanguageModel = trainLanguageModel(sourceWidList);
      this.targetLanguageModel = trainLanguageModel(targetWidList);

      this.translationModel = trainTranslationModel(
        trainIterationCount,
        sourceWidList,
        targetWidList,
        this.targetVocabulary.getWordCount()
      );
    }
  }

  /**
   * Calculates translation score. First it tokenizes source and target
   * segment and replaces the words with identifiers from Vocabulary.
   * If both segment lists are empty returns zero, if only one of them is
   * empty returns language score of it.
   * If both are not empty then returns translation score
   * and adds language score of source segments to it.
   */
  calculateScore(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): number {
    const sourceWidList = tokenize(
      this.splitAlgorithm,
      sourceSegmentList,
      this.sourceVocabulary
    );
    const targetWidList = tokenize(
      this.splitAlgorithm,
      targetSegmentList,
      this.targetVocabulary
    );

    let score: number;

    if (sourceWidList.length === 0 && targetWidList.length === 0) {
      score = 0.0;
    } else if (sourceWidList.length === 0) {
      score = this.calculateLanguageScore(
        targetWidList,
        this.targetLanguageModel
      );
    } else {
      score = this.calculateLanguageScore(
        sourceWidList,
        this.sourceLanguageModel
      );
      if (targetWidList.length > 0) {
        const sourceWidListWithNull = [...sourceWidList, Vocabulary.NULL_WID];
        score += this.calculateTranslationScore(
          sourceWidListWithNull,
          targetWidList,
          this.translationModel
        );
      }
    }

    return score;
  }

  /**
   * Calculates probability (converted to score equal to -ln(probability))
   * of given segment (represented as word id list)
   * is correct according to given language model.
   */
  private calculateLanguageScore(
    widList: readonly (number | null)[],
    languageModel: LanguageModel
  ): number {
    if (widList.length === 0) return 0;

    let score = 0.0;
    for (const wid of widList) {
      let wordProbability: number;
      if (wid !== null) {
        wordProbability = languageModel.getWordProbability(wid);
      } else {
        wordProbability = languageModel.getSingletonWordProbability();
      }
      score += toScore(wordProbability);
    }
    return score;
  }

  /**
   * Calculates probability (converted to score equal to -ln(probability))
   * of given target segments (represented as word id list) being a
   * translation of given source segments according to given translation
   * model.
   */
  private calculateTranslationScore(
    sourceWidList: readonly (number | null)[],
    targetWidList: readonly (number | null)[],
    translationModel: TranslationModel
  ): number {
    if (targetWidList.length === 0) return 0;

    let score = -Math.log(1.0 / sourceWidList.length) * targetWidList.length;

    for (const targetWid of targetWidList) {
      let translationProbability = 0.0;
      if (targetWid !== null) {
        for (const sourceWid of sourceWidList) {
          if (sourceWid !== null) {
            const sourceData = translationModel.get(sourceWid);
            translationProbability +=
              sourceData.getTranslationProbability(targetWid);
          }
        }
      }
      translationProbability = Math.max(
        translationProbability,
        TranslationCalculator.MINIMUM_TRANSLATION_PROBABILITY
      );
      score += -Math.log(translationProbability);
    }

    return score;
  }
}

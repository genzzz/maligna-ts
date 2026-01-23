import { Calculator } from '../Calculator.js';
import { Alignment } from '../../core/Alignment.js';
import {
  Vocabulary,
  defaultTokenize,
  tokenize,
} from '../../model/vocabulary/Vocabulary.js';
import {
  LanguageModel,
  trainLanguageModel,
} from '../../model/language/LanguageModel.js';
import {
  TranslationModel,
  trainTranslationModel,
  DEFAULT_TRAIN_ITERATION_COUNT,
} from '../../model/translation/TranslationModel.js';

/**
 * Represents calculator calculating probability of target segments
 * being translations of source segments.
 *
 * Uses translation and language models trained on a reference corpus
 * (IBM Model 1).
 */
export class TranslationCalculator implements Calculator {
  static readonly MINIMUM_TRANSLATION_PROBABILITY = 1e-38;

  private readonly sourceVocabulary: Vocabulary;
  private readonly targetVocabulary: Vocabulary;
  private readonly sourceLanguageModel: LanguageModel;
  private readonly targetLanguageModel: LanguageModel;
  private readonly translationModel: TranslationModel;

  /**
   * Creates translation calculator with pre-trained models.
   */
  constructor(
    sourceVocabulary: Vocabulary,
    targetVocabulary: Vocabulary,
    sourceLanguageModel: LanguageModel,
    targetLanguageModel: LanguageModel,
    translationModel: TranslationModel
  );

  /**
   * Creates translation calculator by training models from reference alignment.
   */
  constructor(alignmentList: Alignment[], trainIterationCount?: number);

  constructor(
    sourceVocabOrAlignmentList: Vocabulary | Alignment[],
    targetVocabOrTrainCount?: Vocabulary | number,
    sourceLanguageModel?: LanguageModel,
    targetLanguageModel?: LanguageModel,
    translationModel?: TranslationModel
  ) {
    if (Array.isArray(sourceVocabOrAlignmentList)) {
      // Training constructor
      const alignmentList = sourceVocabOrAlignmentList;
      const trainIterationCount =
        (targetVocabOrTrainCount as number) || DEFAULT_TRAIN_ITERATION_COUNT;

      if (alignmentList.length === 0) {
        throw new Error('Reference corpus cannot be empty');
      }

      // Build vocabularies and tokenize
      this.sourceVocabulary = new Vocabulary();
      this.targetVocabulary = new Vocabulary();
      const sourceWidLists: number[][] = [];
      const targetWidLists: number[][] = [];

      for (const alignment of alignmentList) {
        const sourceWids = this.tokenizeAndAdd(
          alignment.getSourceSegmentList(),
          this.sourceVocabulary
        );
        const targetWids = this.tokenizeAndAdd(
          alignment.getTargetSegmentList(),
          this.targetVocabulary
        );
        sourceWidLists.push(sourceWids);
        targetWidLists.push(targetWids);
      }

      // Train language models
      this.sourceLanguageModel = trainLanguageModel(sourceWidLists.flat());
      this.targetLanguageModel = trainLanguageModel(targetWidLists.flat());

      // Add NULL to source sentences for IBM Model 1
      const sourceWidListsWithNull = sourceWidLists.map((wids) => [
        Vocabulary.NULL_WID,
        ...wids,
      ]);

      // Train translation model
      this.translationModel = trainTranslationModel(
        trainIterationCount,
        sourceWidListsWithNull,
        targetWidLists
      );
    } else {
      // Direct constructor with pre-trained models
      this.sourceVocabulary = sourceVocabOrAlignmentList;
      this.targetVocabulary = targetVocabOrTrainCount as Vocabulary;
      this.sourceLanguageModel = sourceLanguageModel!;
      this.targetLanguageModel = targetLanguageModel!;
      this.translationModel = translationModel!;
    }
  }

  private tokenizeAndAdd(
    segments: readonly string[],
    vocabulary: Vocabulary
  ): number[] {
    const wids: number[] = [];
    for (const segment of segments) {
      const words = defaultTokenize(segment);
      for (const word of words) {
        wids.push(vocabulary.putWord(word));
      }
    }
    return wids;
  }

  calculateScore(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): number {
    const sourceWidList = tokenize(
      sourceSegmentList,
      this.sourceVocabulary,
      false
    );
    const targetWidList = tokenize(
      targetSegmentList,
      this.targetVocabulary,
      false
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
        const sourceWidListWithNull = [Vocabulary.NULL_WID, ...sourceWidList];
        score += this.calculateTranslationScore(
          sourceWidListWithNull,
          targetWidList
        );
      }
    }

    return score;
  }

  private calculateLanguageScore(
    widList: number[],
    languageModel: LanguageModel
  ): number {
    let score = 0.0;
    for (const wid of widList) {
      const prob = languageModel.getWordProbability(wid);
      score += -Math.log(prob);
    }
    return score;
  }

  private calculateTranslationScore(
    sourceWidList: number[],
    targetWidList: number[]
  ): number {
    let score = 0.0;
    const sourceLen = sourceWidList.length;

    for (const targetWid of targetWidList) {
      let sum = 0.0;
      for (const sourceWid of sourceWidList) {
        const sourceData = this.translationModel.get(sourceWid);
        const prob =
          sourceData?.getTranslationProbability(targetWid) ||
          TranslationCalculator.MINIMUM_TRANSLATION_PROBABILITY;
        sum += prob;
      }
      score += -Math.log(sum / sourceLen);
    }

    return score;
  }
}

import type { Calculator } from '../Calculator';
import { Vocabulary } from '../../model/vocabulary/Vocabulary';
import type { LanguageModel } from '../../model/language/LanguageModel';
import type { TranslationModel } from '../../model/translation/TranslationModel';
import type { ModifyAlgorithm } from '../../filter/modifier/modify/ModifyAlgorithm';
import { toScore } from '../../util/util';

/**
 * Translation calculator using IBM Model 1.
 *
 * Computes alignment score based on word translation probabilities
 * from a translation model, combined with language model probabilities.
 */
export class TranslationCalculator implements Calculator {
  static readonly MINIMUM_TRANSLATION_PROBABILITY = 1e-38;

  private sourceVocabulary: Vocabulary;
  private targetVocabulary: Vocabulary;
  private sourceLanguageModel: LanguageModel;
  private targetLanguageModel: LanguageModel;
  private translationModel: TranslationModel;
  private tokenizeAlgorithm: ModifyAlgorithm;

  constructor(
    sourceVocabulary: Vocabulary,
    targetVocabulary: Vocabulary,
    sourceLanguageModel: LanguageModel,
    targetLanguageModel: LanguageModel,
    translationModel: TranslationModel,
    tokenizeAlgorithm: ModifyAlgorithm
  ) {
    this.sourceVocabulary = sourceVocabulary;
    this.targetVocabulary = targetVocabulary;
    this.sourceLanguageModel = sourceLanguageModel;
    this.targetLanguageModel = targetLanguageModel;
    this.translationModel = translationModel;
    this.tokenizeAlgorithm = tokenizeAlgorithm;
  }

  /**
   * Calculates translation score. Matches Java's TranslationCalculator.calculateScore.
   *
   * If both segment lists are empty returns zero. If only source is empty,
   * returns language score of target. If source is non-empty, returns language
   * score of source, and if target is also non-empty adds the translation score.
   */
  calculateScore(
    sourceSegmentList: string[],
    targetSegmentList: string[]
  ): number {
    const sourceWords = this.tokenizeAlgorithm.modify(sourceSegmentList);
    const targetWords = this.tokenizeAlgorithm.modify(targetSegmentList);

    // Map words to wids, using null for unknown words
    // (matches Java's Vocabulary.getWid() which returns null for unknowns)
    const sourceWids: (number | null)[] = sourceWords.map((w) =>
      this.sourceVocabulary.containsWord(w) ? this.sourceVocabulary.getWid(w) : null
    );
    const targetWids: (number | null)[] = targetWords.map((w) =>
      this.targetVocabulary.containsWord(w) ? this.targetVocabulary.getWid(w) : null
    );

    // Java: float score
    let score: number;
    if (sourceWids.length === 0 && targetWids.length === 0) {
      score = 0;
    } else if (sourceWids.length === 0) {
      score = this.calculateLanguageScore(targetWids, this.targetLanguageModel);
    } else {
      score = this.calculateLanguageScore(sourceWids, this.sourceLanguageModel);
      if (targetWids.length > 0) {
        const sourceWidsAndNull: (number | null)[] = [...sourceWids, Vocabulary.NULL_WID];
        // Java: float score += float
        score = Math.fround(score + this.calculateTranslationScore(sourceWidsAndNull, targetWids));
      }
    }
    // Java returns float
    return Math.fround(score);
  }

  /**
   * Calculates language score: sum of -ln(wordProbability) for each word.
   * Unknown words (null wid) use singleton word probability.
   */
  private calculateLanguageScore(
    widList: (number | null)[],
    languageModel: LanguageModel
  ): number {
    // Java: float score = 0.0f; score += Util.toScore(float wordProbability)
    let score = 0;
    for (const wid of widList) {
      let wordProbability: number;
      if (wid !== null) {
        wordProbability = languageModel.getWordProbability(wid);
      } else {
        wordProbability = languageModel.getSingletonWordProbability();
      }
      // Java: float += double -> truncate to float
      score = Math.fround(score + toScore(wordProbability));
    }
    return score;
  }

  /**
   * Calculates translation score using IBM Model 1.
   * Works in score space (-ln(probability)) to avoid underflow.
   * sourceWids should already include NULL_WID at the end.
   */
  private calculateTranslationScore(
    sourceWids: (number | null)[],
    targetWids: (number | null)[]
  ): number {
    // Java: float score = -(float)Math.log(1.0 / size) * targetSize
    let score = Math.fround(
      Math.fround(-Math.fround(Math.log(1.0 / sourceWids.length))) * targetWids.length
    );
    for (const targetWid of targetWids) {
      // Java: float translationProbability
      let translationProbability = 0;
      if (targetWid !== null) {
        for (const sourceWid of sourceWids) {
          if (sourceWid !== null) {
            // Java: float += double -> truncate to float
            translationProbability = Math.fround(
              translationProbability +
              this.translationModel
                .get(sourceWid)
                .getTranslationProbability(targetWid)
            );
          }
        }
      }
      translationProbability = Math.fround(
        Math.max(translationProbability, TranslationCalculator.MINIMUM_TRANSLATION_PROBABILITY)
      );
      // Java: score += -(float)Math.log(float translationProbability)
      score = Math.fround(
        score + Math.fround(-Math.fround(Math.log(translationProbability)))
      );
    }
    return score;
  }
}

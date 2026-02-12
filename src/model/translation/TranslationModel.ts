import { TargetData } from './TargetData';
import { Vocabulary } from '../vocabulary/Vocabulary';

/**
 * Source word translation data interface.
 */
export interface SourceData {
  getTranslationProbability(targetWid: number): number;
  getTranslationList(): TargetData[];
}

/**
 * Empty source data — no translations, probability always 0.
 */
export class EmptySourceData implements SourceData {
  getTranslationProbability(_targetWid: number): number {
    return 0;
  }

  getTranslationList(): TargetData[] {
    return [];
  }
}

/**
 * Initial source data — all translations equally probable (probability = 1).
 * Used before first training iteration.
 */
export class InitialSourceData implements SourceData {
  getTranslationProbability(_targetWid: number): number {
    return 1;
  }

  getTranslationList(): TargetData[] {
    return [];
  }
}

/**
 * Translation model interface.
 */
export interface TranslationModel {
  get(sourceWid: number): SourceData;
  format(sourceVocabulary: Vocabulary, targetVocabulary: Vocabulary): string;
}

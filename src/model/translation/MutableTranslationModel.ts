import { TargetData, compareTargetDataByProbability } from './TargetData';
import { SourceData, TranslationModel, InitialSourceData, EmptySourceData } from './TranslationModel';
import { Vocabulary } from '../vocabulary/Vocabulary';

/**
 * Mutable source data for a single source word's translations.
 */
export class MutableSourceData implements SourceData {
  private translationList: TargetData[] = [];

  getTranslationProbability(targetWid: number): number {
    const idx = this.findTargetData(targetWid);
    if (idx !== -1) {
      return this.translationList[idx].probability;
    }
    return 0;
  }

  getTranslationList(): TargetData[] {
    return this.translationList;
  }

  setTranslationProbability(targetWid: number, probability: number): void {
    const newData = new TargetData(targetWid, probability);
    const idx = this.findTargetData(targetWid);
    if (idx !== -1) {
      this.translationList[idx] = newData;
    } else {
      this.translationList.push(newData);
    }
  }

  normalize(): void {
    let totalProbability = 0;
    for (const data of this.translationList) {
      totalProbability += data.probability;
    }
    if (totalProbability > 0) {
      for (let i = 0; i < this.translationList.length; i++) {
        const data = this.translationList[i];
        this.translationList[i] = new TargetData(
          data.wid,
          data.probability / totalProbability
        );
      }
    }
  }

  sort(): void {
    this.translationList.sort(compareTargetDataByProbability);
  }

  private findTargetData(targetWid: number): number {
    for (let i = 0; i < this.translationList.length; i++) {
      if (this.translationList[i].wid === targetWid) {
        return i;
      }
    }
    return -1;
  }
}

/**
 * Mutable translation model (probabilistic dictionary).
 */
export class MutableTranslationModel implements TranslationModel {
  private translationArray: MutableSourceData[] = [];

  get(sourceWid: number): SourceData {
    if (sourceWid >= 0 && sourceWid < this.translationArray.length) {
      return this.translationArray[sourceWid];
    }
    return new EmptySourceData();
  }

  getMutable(sourceWid: number): MutableSourceData {
    this.ensureSize(sourceWid + 1);
    return this.translationArray[sourceWid];
  }

  normalize(): void {
    for (const data of this.translationArray) {
      data.normalize();
    }
  }

  sort(): void {
    for (const data of this.translationArray) {
      data.sort();
    }
  }

  format(sourceVocabulary: Vocabulary, targetVocabulary: Vocabulary): string {
    const lines: string[] = [];
    for (let i = 0; i < this.translationArray.length; i++) {
      const sourceData = this.translationArray[i];
      for (const targetData of sourceData.getTranslationList()) {
        lines.push(
          `${sourceVocabulary.getWord(i)}\t${targetVocabulary.getWord(targetData.wid)}\t${targetData.probability}`
        );
      }
    }
    return lines.join('\n');
  }

  private ensureSize(size: number): void {
    while (this.translationArray.length < size) {
      this.translationArray.push(new MutableSourceData());
    }
  }
}

/**
 * Initial translation model — all translation probabilities are 1.
 */
export class InitialTranslationModel implements TranslationModel {
  private translationData = new InitialSourceData();

  get(_sourceWid: number): SourceData {
    return this.translationData;
  }

  format(): string {
    throw new Error('Cannot format initial translation model');
  }
}

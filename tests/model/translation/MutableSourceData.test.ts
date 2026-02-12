import { describe, test, expect } from 'vitest';
import { MutableSourceData } from '../../../src/model/translation/MutableTranslationModel';

describe('MutableSourceDataTest', () => {
  test('getPutSortNormalize', () => {
    const data = new MutableSourceData();
    expect(data.getTranslationList().length).toBe(0);
    expect(data.getTranslationProbability(0)).toBeCloseTo(0, 6);
    data.setTranslationProbability(0, 0.6);
    expect(data.getTranslationProbability(0)).toBeCloseTo(0.6, 6);
    data.setTranslationProbability(1, 1.0);
    expect(data.getTranslationProbability(1)).toBeCloseTo(1.0, 6);
    data.setTranslationProbability(2, 0.4);
    expect(data.getTranslationProbability(2)).toBeCloseTo(0.4, 6);
    data.normalize();
    data.sort();
    const targetList = data.getTranslationList();
    expect(targetList.length).toBe(3);
    let target = targetList[0];
    expect(target.probability).toBeCloseTo(0.5, 6);
    expect(target.wid).toBe(1);
    target = targetList[1];
    expect(target.probability).toBeCloseTo(0.3, 6);
    expect(target.wid).toBe(0);
    target = targetList[2];
    expect(target.probability).toBeCloseTo(0.2, 6);
    expect(target.wid).toBe(2);
  });
});

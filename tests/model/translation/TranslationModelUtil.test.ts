import { describe, test, expect } from 'vitest';
import { parseTranslationModel, trainTranslationModel } from '../../../src/model/translation/TranslationModelUtil';
import { Vocabulary } from '../../../src/model/vocabulary/Vocabulary';
import { createWidList } from '../../util/TestUtil';

describe('TranslationModelUtilTest', () => {
  // Skipped: Same as Java @Ignore — the Moore minimum-probability-change optimization
  // (TranslationModelUtil.ts lines 79-85) redirects low-probability translations to NULL_WID,
  // which changes the convergence behavior. The expected probability values below were computed
  // before this optimization was added. Both Java and TS implementations include it.
  test.skip('train', () => {
    const sourceWidArray = [
      [],
      [2],
      [1, 2, 3],
    ];
    const targetWidArray = [
      [3],
      [2],
      [1, 2],
    ];
    const sourceWidList = createWidList(sourceWidArray);
    const targetWidList = createWidList(targetWidArray);
    const model = trainTranslationModel(1, sourceWidList, targetWidList);
    let sourceData;
    let targetDataList;
    let targetData;

    sourceData = model.get(0);
    targetDataList = sourceData.getTranslationList();
    expect(targetDataList.length).toBe(3);
    targetData = targetDataList[0];
    expect(targetData.wid).toBe(3);
    expect(targetData.probability).toBeCloseTo(0.5, 1);
    targetData = targetDataList[1];
    expect(targetData.wid).toBe(2);
    expect(targetData.probability).toBeCloseTo(0.375, 1);
    targetData = targetDataList[2];
    expect(targetData.wid).toBe(1);
    expect(targetData.probability).toBeCloseTo(0.125, 1);

    sourceData = model.get(1);
    targetDataList = sourceData.getTranslationList();
    expect(targetDataList.length).toBe(2);
    targetData = targetDataList[0];
    expect(targetData.wid).toBe(1);
    expect(targetData.probability).toBeCloseTo(0.5, 1);
    targetData = targetDataList[1];
    expect(targetData.wid).toBe(2);
    expect(targetData.probability).toBeCloseTo(0.5, 1);

    sourceData = model.get(2);
    targetDataList = sourceData.getTranslationList();
    expect(targetDataList.length).toBe(2);
    targetData = targetDataList[0];
    expect(targetData.wid).toBe(2);
    expect(targetData.probability).toBeCloseTo(0.75, 1);
    targetData = targetDataList[1];
    expect(targetData.wid).toBe(1);
    expect(targetData.probability).toBeCloseTo(0.25, 1);

    sourceData = model.get(3);
    targetDataList = sourceData.getTranslationList();
    expect(targetDataList.length).toBe(2);
    targetData = targetDataList[0];
    expect(targetData.wid).toBe(1);
    expect(targetData.probability).toBeCloseTo(0.5, 1);
    targetData = targetDataList[1];
    expect(targetData.wid).toBe(2);
    expect(targetData.probability).toBeCloseTo(0.5, 1);

    for (let i = 2; i < 4; i++) {
      const oldModel = model;
      const newModel = trainTranslationModel(i, sourceWidList, targetWidList);
      expect(newModel.get(0).getTranslationProbability(3)).toBeGreaterThan(
        oldModel.get(0).getTranslationProbability(3)
      );
      const delta0To2 =
        oldModel.get(0).getTranslationProbability(2) -
        newModel.get(0).getTranslationProbability(2);
      const delta0To1 =
        oldModel.get(0).getTranslationProbability(1) -
        newModel.get(0).getTranslationProbability(1);
      expect(delta0To2).toBeLessThan(delta0To1);
      expect(newModel.get(2).getTranslationProbability(2)).toBeGreaterThan(
        oldModel.get(2).getTranslationProbability(2)
      );
    }
  });

  const TRANSLATION_MODEL =
    'b\tC\t0.1\n' +
    'b\tD\t0.3\n' +
    'c\tA\t0.5\n' +
    'a\tD\t0.33\n' +
    ' ';

  test('testParse', () => {
    const sourceVocabulary = new Vocabulary();
    const targetVocabulary = new Vocabulary();
    const translationModel = parseTranslationModel(
      TRANSLATION_MODEL,
      sourceVocabulary,
      targetVocabulary
    );
    let sourceData;
    sourceData = translationModel.get(sourceVocabulary.getWid('a'));
    expect(sourceData.getTranslationList().length).toBe(1);
    expect(sourceData.getTranslationProbability(targetVocabulary.getWid('A'))).toBeCloseTo(0.0, 4);
    expect(sourceData.getTranslationProbability(targetVocabulary.getWid('D'))).toBeCloseTo(1.0, 4);
    sourceData = translationModel.get(sourceVocabulary.getWid('b'));
    expect(sourceData.getTranslationList().length).toBe(2);
    expect(sourceData.getTranslationProbability(targetVocabulary.getWid('C'))).toBeCloseTo(0.25, 4);
    expect(sourceData.getTranslationProbability(targetVocabulary.getWid('D'))).toBeCloseTo(0.75, 4);
    sourceData = translationModel.get(sourceVocabulary.getWid('c'));
    expect(sourceData.getTranslationList().length).toBe(1);
    expect(sourceData.getTranslationProbability(targetVocabulary.getWid('A'))).toBeCloseTo(1.0, 4);
    sourceData = translationModel.get(100);
    expect(sourceData.getTranslationList().length).toBe(0);
  });
});

import { describe, test, expect } from 'vitest';
import { trainLanguageModel, parseLanguageModel } from '../../../src/model/language/LanguageModelUtil';
import { MutableLanguageModel } from '../../../src/model/language/LanguageModel';
import { createWidList } from '../../util/TestUtil';

describe('LanguageModelUtilTest', () => {
  test('train', () => {
    const widArray = [
      [1, 2, 1],
      [1],
      [2],
      [],
    ];
    const widList = createWidList(widArray);
    const model = trainLanguageModel(widList);
    expect(model.getWordProbability(1)).toBeCloseTo(0.6, 2);
    expect(model.getWordProbability(2)).toBeCloseTo(0.4, 2);
    expect(model.getWordProbability(0)).toBeCloseTo(0.0, 2);
    expect(model.getSingletonWordProbability()).toBeCloseTo(0.2, 2);
  });

  // Matches Java's LanguageModelUtilTest.testParse()
  // Format: "wid\tcount" per line
  const LANGUAGE_MODEL = '3\t2\n1\t3\n2\t0\n ';

  test('testParse', () => {
    const languageModel = parseLanguageModel(LANGUAGE_MODEL);
    expect(languageModel.getSingletonWordProbability()).toBeCloseTo(0.2, 4);
    expect(languageModel.getWordProbability(1)).toBeCloseTo(0.6, 4);
    expect(languageModel.getWordProbability(2)).toBeCloseTo(0.0, 4);
  });
});

describe('MutableLanguageModelTest', () => {
  test('word', () => {
    const model = new MutableLanguageModel();
    expect(model.getWordProbability(1)).toBeCloseTo(0.0, 2);
    model.addWord(1);
    model.addWord(1);
    model.addWord(1);
    model.addWord(2);
    model.normalize();
    expect(model.getWordProbability(1)).toBeCloseTo(0.75, 2);
    expect(model.getWordProbability(2)).toBeCloseTo(0.25, 2);
    expect(model.getSingletonWordProbability()).toBeCloseTo(0.25, 2);
  });
});

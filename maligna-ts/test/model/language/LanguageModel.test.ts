import { MutableLanguageModel, trainLanguageModel } from '../../../src/model/language/LanguageModel';

/**
 * Represents MutableLanguageModel unit test.
 */
describe('MutableLanguageModel', () => {
  /**
   * Checks if model probabilities are calculated properly.
   */
  test('word', () => {
    const model = new MutableLanguageModel();
    expect(model.getWordProbability(1)).toBeCloseTo(0.0, 2);
    model.addWordOccurrence(1);
    model.addWordOccurrence(1);
    model.addWordOccurrence(1);
    model.addWordOccurrence(2);
    model.normalize();
    expect(model.getWordProbability(1)).toBeCloseTo(0.75, 2);
    expect(model.getWordProbability(2)).toBeCloseTo(0.25, 2);
    expect(model.getSingletonWordProbability()).toBeCloseTo(0.25, 2);
  });
});

/**
 * Represents LanguageModelUtil unit test.
 */
describe('LanguageModelUtil', () => {
  /**
   * Tests if model training produces expected probabilities.
   */
  test('train', () => {
    const widArray: number[][] = [[1, 2, 1], [1], [2], []];
    const model = trainLanguageModel(widArray);
    expect(model.getWordProbability(1)).toBeCloseTo(0.6, 2);
    expect(model.getWordProbability(2)).toBeCloseTo(0.4, 2);
    expect(model.getWordProbability(0)).toBeCloseTo(0.0, 2);
    expect(model.getSingletonWordProbability()).toBeCloseTo(0.2, 2);
  });
});

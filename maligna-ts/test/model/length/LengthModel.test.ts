import { MutableLengthModel, trainLengthModel } from '../../../src/model/length/LengthModel';

/**
 * Represents MutableLengthModel unit test.
 */
describe('MutableLengthModel', () => {
  /**
   * Checks if length probabilities are calculated correctly.
   */
  test('length', () => {
    const model = new MutableLengthModel();
    expect(model.getLengthProbability(3)).toBeCloseTo(0.0, 2);
    model.addLengthOccurrence(3);
    model.addLengthOccurrence(3);
    model.addLengthOccurrence(3);
    model.addLengthOccurrence(2);
    model.normalize();
    expect(model.getLengthProbability(3)).toBeCloseTo(0.75, 2);
    expect(model.getLengthProbability(2)).toBeCloseTo(0.25, 2);
    expect(model.meanLength).toBeCloseTo(2.75, 2);
  });
});

/**
 * Represents LengthModelUtil test suite.
 */
describe('LengthModelUtil', () => {
  /**
   * Checks if length probabilities are calculated correctly.
   */
  test('train', () => {
    const lengthList = [3, 1, 1, 0];
    const model = trainLengthModel(lengthList);
    expect(model.getLengthProbability(0)).toBeCloseTo(0.25, 2);
    expect(model.getLengthProbability(1)).toBeCloseTo(0.5, 2);
    expect(model.getLengthProbability(2)).toBeCloseTo(0.0, 2);
    expect(model.getLengthProbability(3)).toBeCloseTo(0.25, 2);
    expect(model.meanLength).toBeCloseTo(1.25, 2);
  });
});

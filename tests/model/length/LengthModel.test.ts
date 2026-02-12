import { describe, test, expect } from 'vitest';
import { trainLengthModel } from '../../../src/model/length/LengthModelUtil';
import { MutableLengthModel } from '../../../src/model/length/LengthModel';

describe('LengthModelUtilTest', () => {
  test('train', () => {
    const lengthList = [3, 1, 1, 0];
    const model = trainLengthModel(lengthList);
    expect(model.getLengthProbability(0)).toBeCloseTo(0.25, 1);
    expect(model.getLengthProbability(1)).toBeCloseTo(0.5, 1);
    expect(model.getLengthProbability(2)).toBeCloseTo(0.0, 1);
    expect(model.getLengthProbability(3)).toBeCloseTo(0.25, 1);
    expect(model.getMeanLength()).toBeCloseTo(1.25, 1);
  });
});

describe('MutableLengthModelTest', () => {
  test('length', () => {
    const model = new MutableLengthModel();
    expect(model.getLengthProbability(3)).toBeCloseTo(0.0, 1);
    model.addLength(3);
    model.addLength(3);
    model.addLength(3);
    model.addLength(2);
    model.normalize();
    expect(model.getLengthProbability(3)).toBeCloseTo(0.75, 1);
    expect(model.getLengthProbability(2)).toBeCloseTo(0.25, 1);
    expect(model.getMeanLength()).toBeCloseTo(2.75, 1);
  });
});

import { describe, test, expect } from 'vitest';
import { MutableTranslationModel } from '../../../src/model/translation/MutableTranslationModel';

describe('MutableTranslationModelTest', () => {
  test('putNormalizeSort', () => {
    const model = new MutableTranslationModel();

    expect(model.get(0).getTranslationList().length).toBe(0);

    model.getMutable(1).setTranslationProbability(0, 0.5);
    model.getMutable(1).setTranslationProbability(1, 1.5);

    expect(model.get(1).getTranslationProbability(0)).toBeCloseTo(0.5, 5);
    expect(model.get(1).getTranslationProbability(1)).toBeCloseTo(1.5, 5);
    model.normalize();
    expect(model.get(1).getTranslationProbability(0)).toBeCloseTo(0.25, 5);
    expect(model.get(1).getTranslationProbability(1)).toBeCloseTo(0.75, 5);

    expect(model.get(1).getTranslationList()[0].wid).toBe(0);
    model.sort();
    expect(model.get(1).getTranslationList()[0].wid).toBe(1);
  });
});

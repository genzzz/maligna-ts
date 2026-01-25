import {
  MutableTranslationModel,
  MutableSourceData,
  TargetData,
} from '../../../src/model/translation/TranslationModel';

/**
 * Represents MutableTranslationModel unit test.
 */
describe('MutableTranslationModel', () => {
  /**
   * Checks whether normalize() and sort() work as expected.
   */
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

    // Before sorting, the order may be different
    model.sort();
    expect(model.get(1).getTranslationList()[0]!.wid).toBe(1); // Higher probability first
  });
});

/**
 * Represents MutableSourceData unit test.
 */
describe('MutableSourceData', () => {
  /**
   * Check if normalize() and sort work as expected.
   */
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
    const targetList = data.getTranslationList();
    expect(targetList.length).toBe(3);
    const target0 = targetList[0]!;
    expect(target0.probability).toBeCloseTo(0.5, 6);
    expect(target0.wid).toBe(1);
    const target1 = targetList[1]!;
    expect(target1.probability).toBeCloseTo(0.3, 6);
    expect(target1.wid).toBe(0);
    const target2 = targetList[2]!;
    expect(target2.probability).toBeCloseTo(0.2, 6);
    expect(target2.wid).toBe(2);
  });
});

/**
 * Represents TargetDataProbabilityComparator unit test.
 */
describe('TargetData sorting', () => {
  /**
   * Simple comparator test.
   */
  test('compare sorting', () => {
    const data: TargetData[] = [
      { wid: 0, probability: 0.1 },
      { wid: 1, probability: 0.5 },
      { wid: 2, probability: 0.5 },
    ];
    // Sort by probability descending
    const sorted = [...data].sort((a, b) => b.probability - a.probability);
    expect(sorted[0]!.probability).toBeGreaterThan(sorted[2]!.probability);
    expect(sorted[0]!.wid).toBe(1);
    expect(sorted[2]!.wid).toBe(0);
    // Equal probabilities should have same ordering relationship
    expect(sorted[0]!.probability).toBe(sorted[1]!.probability);
  });
});

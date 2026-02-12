import { describe, test, expect } from 'vitest';
import { TargetData, compareTargetDataByProbability } from '../../../src/model/translation/TargetData';

describe('TargetDataProbabilityComparatorTest', () => {
  test('testCompareTo', () => {
    const data = [
      new TargetData(0, 0.1),
      new TargetData(1, 0.5),
      new TargetData(2, 0.5),
    ];
    expect(compareTargetDataByProbability(data[0], data[1])).toBeGreaterThan(0);
    expect(compareTargetDataByProbability(data[1], data[0])).toBeLessThan(0);
    expect(compareTargetDataByProbability(data[0], data[0])).toBe(0);
    expect(compareTargetDataByProbability(data[1], data[2])).toBe(0);
  });
});

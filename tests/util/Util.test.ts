import { describe, test, expect } from 'vitest';
import { Alignment } from '../../src/coretypes/Alignment';
import { scoreSum, toScore, toProbability } from '../../src/util/util';
import { assertAlignmentEquals } from './TestUtil';

describe('UtilTest', () => {
  test('alignManyToZero', () => {
    const segmentList = ['a', 'b'];
    const alignment = new Alignment(segmentList, []);
    assertAlignmentEquals(['a', 'b'], [], alignment);
  });

  test('alignZeroToMany', () => {
    const segmentList = ['a', 'b'];
    const alignment = new Alignment([], segmentList);
    assertAlignmentEquals([], ['a', 'b'], alignment);
  });

  test('alignManyToMany', () => {
    const sourceList = ['a', 'b'];
    const targetList = ['c', 'd', 'e'];
    const alignment = new Alignment(sourceList, targetList);
    assertAlignmentEquals(['a', 'b'], ['c', 'd', 'e'], alignment);
  });

  test('assertAlignmentEquals', () => {
    const alignment = new Alignment(['a', 'b'], ['c'], 0.5);
    assertAlignmentEquals(['a', 'b'], ['c'], alignment);
    expect(() =>
      assertAlignmentEquals(['a', 'b'], ['d'], alignment)
    ).toThrow();
  });

  const PROBABILITY_ARRAY = [
    [0.1],
    [0.1, 0.3],
    [0.1, 0.3, 0.2],
  ];

  test('testScoreSum', () => {
    const emptyScoreList: number[] = [];
    expect(scoreSum(emptyScoreList)).toBe(Infinity);

    for (let i = 0; i < PROBABILITY_ARRAY.length; i++) {
      const probabilityArray = PROBABILITY_ARRAY[i];
      const expectedProbability = sum(probabilityArray);
      const expectedScore = toScore(expectedProbability);
      const scoreList = toScoreArray(probabilityArray);
      const actualScore = scoreSum(scoreList);
      const actualProbability = toProbability(actualScore);
      expect(actualProbability).toBeCloseTo(expectedProbability, 4);
      expect(actualScore).toBeCloseTo(expectedScore, 4);
    }
  });

  function sum(array: number[]): number {
    let total = 0;
    for (const element of array) {
      total += element;
    }
    return total;
  }

  function toScoreArray(probabilityArray: number[]): number[] {
    const scoreList: number[] = [];
    for (const probability of probabilityArray) {
      const score = toScore(probability);
      scoreList.push(score);
    }
    return scoreList;
  }
});

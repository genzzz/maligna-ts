import { Alignment } from '../../src/coretypes/Alignment';
import {
  alignManyToZero,
  alignZeroToMany,
  alignManyToMany,
  scoreSum,
  toScore,
  toProbability,
} from '../../src/util/Util';
import { assertAlignmentEquals } from './TestUtil';

/**
 * Represents utility methods test.
 */
describe('Util', () => {
  test('alignManyToZero', () => {
    const alignmentList = alignManyToZero(['a', 'b']);
    expect(alignmentList.length).toBe(1);
    const alignment = alignmentList[0]!;
    assertAlignmentEquals(['a', 'b'], [], alignment);
  });

  test('alignZeroToMany', () => {
    const alignmentList = alignZeroToMany(['a', 'b']);
    expect(alignmentList.length).toBe(1);
    const alignment = alignmentList[0]!;
    assertAlignmentEquals([], ['a', 'b'], alignment);
  });

  test('alignManyToMany', () => {
    const alignmentList = alignManyToMany(['a', 'b'], ['c', 'd', 'e']);
    expect(alignmentList.length).toBe(1);
    const alignment = alignmentList[0]!;
    assertAlignmentEquals(['a', 'b'], ['c', 'd', 'e'], alignment);
  });

  test('assertAlignmentEquals', () => {
    const alignment = new Alignment(['a', 'b'], ['c'], 0.5);
    assertAlignmentEquals(['a', 'b'], ['c'], alignment);
    expect(() => {
      assertAlignmentEquals(['a', 'b'], ['d'], alignment);
    }).toThrow();
  });

  const PROBABILITY_ARRAY: number[][] = [[0.1], [0.1, 0.3], [0.1, 0.3, 0.2]];

  test('scoreSum', () => {
    const emptyScoreList: number[] = [];
    expect(scoreSum(emptyScoreList)).toBeCloseTo(0.0, 5);
    for (let i = 0; i < PROBABILITY_ARRAY.length; i++) {
      const probabilityArray = PROBABILITY_ARRAY[i]!;
      const expectedProbability = sum(probabilityArray);
      const expectedScore = toScore(expectedProbability);
      const scoreList = toScoreArray(probabilityArray);
      const actualScore = scoreSum(scoreList);
      const actualProbability = toProbability(actualScore);
      expect(actualProbability).toBeCloseTo(expectedProbability, 5);
      expect(actualScore).toBeCloseTo(expectedScore, 5);
    }
  });

  function sum(array: number[]): number {
    let result = 0;
    for (const element of array) {
      result += element;
    }
    return result;
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

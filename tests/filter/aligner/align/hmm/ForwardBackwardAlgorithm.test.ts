import { describe, beforeEach } from 'vitest';
import { ForwardBackwardAlgorithm } from '../../../../../src/filter/aligner/align/hmm/fb/ForwardBackwardAlgorithm';
import { NormalDistributionCalculator } from '../../../../../src/calculator/length/NormalDistributionCalculator';
import { CharCounter } from '../../../../../src/calculator/length/Counter';
import { BEST_CATEGORY_MAP } from '../../../../../src/coretypes/CategoryDefaults';
import { FullMatrixFactory } from '../../../../../src/matrix/FullMatrix';
import { runHmmAlignAlgorithmTests } from './HmmAlignAlgorithmTest';

describe('ForwardBackwardAlgorithmTest', () => {
  let algorithm: ForwardBackwardAlgorithm;

  beforeEach(() => {
    const counter = new CharCounter();
    const calculator = new NormalDistributionCalculator(counter);
    const matrixFactory = new FullMatrixFactory<number>();

    algorithm = new ForwardBackwardAlgorithm(
      calculator,
      BEST_CATEGORY_MAP,
      matrixFactory
    );
  });

  runHmmAlignAlgorithmTests(() => algorithm);
});

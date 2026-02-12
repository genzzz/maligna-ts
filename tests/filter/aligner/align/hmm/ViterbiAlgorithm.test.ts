import { describe, beforeEach } from 'vitest';
import { ViterbiAlgorithm } from '../../../../../src/filter/aligner/align/hmm/viterbi/ViterbiAlgorithm';
import { NormalDistributionCalculator } from '../../../../../src/calculator/length/NormalDistributionCalculator';
import { CharCounter } from '../../../../../src/calculator/length/Counter';
import { BEST_CATEGORY_MAP } from '../../../../../src/coretypes/CategoryDefaults';
import { FullMatrixFactory } from '../../../../../src/matrix/FullMatrix';
import { ViterbiData } from '../../../../../src/filter/aligner/align/hmm/viterbi/ViterbiAlgorithm';
import { runHmmAlignAlgorithmTests } from './HmmAlignAlgorithmTest';

describe('ViterbiAlgorithmTest', () => {
  let algorithm: ViterbiAlgorithm;

  beforeEach(() => {
    const counter = new CharCounter();
    const calculator = new NormalDistributionCalculator(counter);
    const matrixFactory = new FullMatrixFactory<ViterbiData>();

    algorithm = new ViterbiAlgorithm(
      calculator,
      BEST_CATEGORY_MAP,
      matrixFactory
    );
  });

  runHmmAlignAlgorithmTests(() => algorithm);
});

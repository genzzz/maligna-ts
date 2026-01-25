import { ViterbiAlgorithm } from '../../../../../src/filter/aligner/align/hmm/viterbi/ViterbiAlgorithm';
import { ForwardBackwardAlgorithm } from '../../../../../src/filter/aligner/align/hmm/fb/ForwardBackwardAlgorithm';
import { NormalDistributionCalculator } from '../../../../../src/calculator/length/NormalDistributionCalculator';
import { CharCounter } from '../../../../../src/calculator/length/counter/CharCounter';
import { BEST_CATEGORY_MAP } from '../../../../../src/coretypes/CategoryDefaults';
import { FullMatrixFactory } from '../../../../../src/matrix/FullMatrixFactory';
import { AlignAlgorithm } from '../../../../../src/filter/aligner/align/AlignAlgorithm';
import {
  assertAlignmentEquals,
  assertAlignmentListContains,
  assertAlignmentListEquals,
} from '../../../../util/TestUtil';

/**
 * Abstract HMM algorithm test that can be used for different implementations.
 */
function createHmmAlgorithmTests(
  algorithmName: string,
  createAlgorithm: () => AlignAlgorithm
) {
  describe(algorithmName, () => {
    let algorithm: AlignAlgorithm;

    beforeEach(() => {
      algorithm = createAlgorithm();
    });

    /**
     * Tests whether one to zero alignment works correctly.
     * Encountered a problem that when last alignment is 1-0 then backtrace
     * ignores it.
     */
    test('testOneToZero', () => {
      const sourceSegments = ['Segment 1'];
      const targetSegments: string[] = [];

      const result = algorithm.align(sourceSegments, targetSegments);

      expect(result.length).toBe(1);
      assertAlignmentEquals(sourceSegments, targetSegments, result[0]!);
    });

    /**
     * Tests if when aligning three to one all segments will be preserved.
     */
    test('testPreservesAllSegments', () => {
      const sourceSegments = [
        'He had given up attending to matters of practical importance; he had lost all desire to do so.',
        'Nothing that any landlady could do had a real terror for him.',
        'But to be stopped on the stairs, to be forced to listen to her trivial, irrelevant gossip, to pestering demands for payment, threats and complaints, and to rack his brains for excuses, to prevaricate, to lie—no, rather than that, he would creep down the stairs like a cat and slip out unseen.',
      ];

      const targetSegments = [
        'Aber auf der Treppe stehenzubleiben, allerlei Gewäsch über allen möglichen ihm ganz gleichgültigen Alltagskram, all diese Mahnungen ans Bezahlen, die Drohungen und Klagen anzuhören und dabei selbst sich herauszuwinden, sich zu entschuldigen, zu lügen – nein, da war es schon besser, wie eine Katze auf der Treppe vorbeizuschlüpfen und sich, ohne von jemand gesehen zu werden, flink davonzumachen.',
      ];

      const result = algorithm.align(sourceSegments, targetSegments);

      assertAlignmentListContains(sourceSegments, targetSegments, result);
    });

    /**
     * This is a little more advanced test for aligner.
     * It tests aligning interleaved short and long segments,
     * which logically should be aligned fine if aligner is correct.
     * Bug reported by Boyan Ivanov Bonev.
     */
    test('testVeryShortAndLongInterleaved', () => {
      const sourceSegments = [
        'Presidente',
        '1.',
        'Reanudación del período de Sesiones',
        'Se abre la sesión a las 17.00 horas.',
        '2.',
        'Aprobación del Acta de la sesión anterior',
        'Se aprueba el Acta de la sesión anterior.',
        '3.',
        'Composición del Parlamento',
      ];

      const targetSegments = [
        'President',
        '1.',
        'Resumption of the session',
        'The sitting opened at 17.00.',
        '2.',
        'Approval of the Minutes of the previous sitting',
        'The Minutes of the previous sitting were approved.',
        '3.',
        'Composition of Parliament',
      ];

      const expectedSourceSegments = createArrayOfSingletons(sourceSegments);
      const expectedTargetSegments = createArrayOfSingletons(targetSegments);

      const result = algorithm.align(sourceSegments, targetSegments);

      assertAlignmentListEquals(
        expectedSourceSegments,
        expectedTargetSegments,
        result
      );
    });
  });
}

/**
 * Creates an array of array of string where every element is a single
 * element array. Elements are taken from input array.
 */
function createArrayOfSingletons(segmentArray: string[]): string[][] {
  const result: string[][] = [];
  for (const segment of segmentArray) {
    result.push([segment]);
  }
  return result;
}

// Viterbi Algorithm Tests
createHmmAlgorithmTests('ViterbiAlgorithm', () => {
  const counter = new CharCounter();
  const calculator = new NormalDistributionCalculator(counter);
  const matrixFactory = new FullMatrixFactory();

  return new ViterbiAlgorithm(calculator, BEST_CATEGORY_MAP, matrixFactory);
});

// Forward Backward Algorithm Tests
createHmmAlgorithmTests('ForwardBackwardAlgorithm', () => {
  const counter = new CharCounter();
  const calculator = new NormalDistributionCalculator(counter);
  const matrixFactory = new FullMatrixFactory();

  return new ForwardBackwardAlgorithm(
    calculator,
    BEST_CATEGORY_MAP,
    matrixFactory
  );
});

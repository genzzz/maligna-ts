import { test, expect } from 'vitest';
import { AlignAlgorithm } from '../../../../../src/filter/aligner/align/AlignAlgorithm';
import { assertAlignmentEquals, assertAlignmentListEquals, assertAlignmentListContains } from '../../../../util/TestUtil';

/**
 * Shared test cases for HMM alignment algorithms.
 * Call these from specific algorithm test files.
 */
export function runHmmAlignAlgorithmTests(
  getAlgorithm: () => AlignAlgorithm
): void {
  test('testOneToZero', () => {
    const sourceSegments = ['Segment 1'];
    const targetSegments: string[] = [];

    const algorithm = getAlgorithm();
    const result = algorithm.align(sourceSegments, targetSegments);

    expect(result.length).toBe(1);
    assertAlignmentEquals(sourceSegments, targetSegments, result[0]);
  });

  test('testPreservesAllSegments', () => {
    const sourceSegments = [
      'He had given up attending to matters of practical importance; he had lost all desire to do so.',
      'Nothing that any landlady could do had a real terror for him.',
      "But to be stopped on the stairs, to be forced to listen to her trivial, irrelevant gossip, to pestering demands for payment, threats and complaints, and to rack his brains for excuses, to prevaricate, to lie—no, rather than that, he would creep down the stairs like a cat and slip out unseen."
    ];

    const targetSegments = [
      'Aber auf der Treppe stehenzubleiben, allerlei Gewäsch über allen möglichen ihm ganz gleichgültigen Alltagskram, all diese Mahnungen ans Bezahlen, die Drohungen und Klagen anzuhören und dabei selbst sich herauszuwinden, sich zu entschuldigen, zu lügen – nein, da war es schon besser, wie eine Katze auf der Treppe vorbeizuschlüpfen und sich, ohne von jemand gesehen zu werden, flink davonzumachen.'
    ];

    const algorithm = getAlgorithm();
    const result = algorithm.align(sourceSegments, targetSegments);

    assertAlignmentListContains(sourceSegments, targetSegments, result);
  });

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

    const algorithm = getAlgorithm();
    const result = algorithm.align(sourceSegments, targetSegments);

    assertAlignmentListEquals(expectedSourceSegments, expectedTargetSegments, result);
  });
}

function createArrayOfSingletons(segmentArray: string[]): string[][] {
  return segmentArray.map(segment => [segment]);
}

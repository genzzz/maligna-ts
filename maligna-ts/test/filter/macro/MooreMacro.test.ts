import { MooreMacro } from '../../../src/filter/macro/MooreMacro';
import {
  createAlignmentList,
  assertAlignmentListContains,
} from '../../util/TestUtil';

/**
 * Represents MooreMacro unit test.
 */
describe('MooreMacro', () => {
  let macro: MooreMacro;

  beforeEach(() => {
    macro = new MooreMacro();
  });

  /**
   * Tests if when aligning three to one no NullPointerException
   * will be thrown, as it was the case.
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

    const alignmentList = createAlignmentList(
      [sourceSegments],
      [targetSegments]
    );

    const result = macro.apply(alignmentList);

    assertAlignmentListContains(sourceSegments, targetSegments, result);
  });
});

import { Alignment } from '../../../src/core/Alignment';
import { PoissonMacro } from '../../../src/filter/macro/PoissonMacro';

describe('PoissonMacro', () => {
  const macro = new PoissonMacro();

  describe('apply', () => {
    it('should align multiple segments', () => {
      const alignments = [
        new Alignment(
          ['Hello world.', 'How are you?', 'I am fine.'],
          ['Bonjour monde.', 'Comment allez-vous?', 'Je vais bien.']
        ),
      ];

      const result = macro.apply(alignments);

      // Should produce multiple alignments
      expect(result.length).toBeGreaterThan(0);

      // All segments should be accounted for
      const totalSource = result.reduce(
        (sum, a) => sum + a.getSourceSegmentList().length,
        0
      );
      const totalTarget = result.reduce(
        (sum, a) => sum + a.getTargetSegmentList().length,
        0
      );

      expect(totalSource).toBe(3);
      expect(totalTarget).toBe(3);
    });

    it('should handle single 1-1 input', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
      ];

      const result = macro.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['Hello']);
      expect(result[0].getTargetSegmentList()).toEqual(['Bonjour']);
    });

    it('should handle empty alignment list', () => {
      const result = macro.apply([]);
      expect(result.length).toBe(0);
    });

    it('should assign scores to alignments', () => {
      const alignments = [
        new Alignment(
          ['One sentence.', 'Another sentence.'],
          ['Une phrase.', 'Une autre phrase.']
        ),
      ];

      const result = macro.apply(alignments);

      for (const alignment of result) {
        expect(typeof alignment.score).toBe('number');
        expect(alignment.score).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle unbalanced input', () => {
      const alignments = [
        new Alignment(
          ['Short.', 'A much longer sentence with more words.'],
          ['Court.', 'Une phrase plus longue.', 'Et une autre.']
        ),
      ];

      const result = macro.apply(alignments);

      // All segments must be used
      const totalSource = result.reduce(
        (sum, a) => sum + a.getSourceSegmentList().length,
        0
      );
      const totalTarget = result.reduce(
        (sum, a) => sum + a.getTargetSegmentList().length,
        0
      );

      expect(totalSource).toBe(2);
      expect(totalTarget).toBe(3);
    });

    it('should process multiple input alignments', () => {
      const alignments = [
        new Alignment(['Para1 Sent1.', 'Para1 Sent2.'], ['P1 S1.', 'P1 S2.']),
        new Alignment(['Para2 Sent1.'], ['P2 S1.']),
      ];

      const result = macro.apply(alignments);

      const totalSource = result.reduce(
        (sum, a) => sum + a.getSourceSegmentList().length,
        0
      );
      const totalTarget = result.reduce(
        (sum, a) => sum + a.getTargetSegmentList().length,
        0
      );

      expect(totalSource).toBe(3);
      expect(totalTarget).toBe(3);
    });
  });
});

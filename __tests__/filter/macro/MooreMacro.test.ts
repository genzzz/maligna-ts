import { Alignment } from '../../../src/core/Alignment';
import { MooreMacro } from '../../../src/filter/macro/MooreMacro';

describe('MooreMacro', () => {
  const macro = new MooreMacro();

  describe('SELECT_FRACTION', () => {
    it('should have default fraction of 0.85', () => {
      expect(MooreMacro.SELECT_FRACTION).toBe(0.85);
    });
  });

  describe('apply', () => {
    it('should align with content-based scoring', () => {
      // Need enough data for translation model training
      const alignments = [
        new Alignment(
          [
            'Hello world.',
            'How are you today?',
            'I am doing well.',
            'Thank you for asking.',
            'The weather is nice.',
            'I like sunny days.',
            'See you tomorrow.',
            'Have a good day.',
          ],
          [
            'Bonjour monde.',
            'Comment allez-vous aujourd hui?',
            'Je vais bien.',
            'Merci de demander.',
            'Le temps est beau.',
            'J aime les jours ensoleilles.',
            'A demain.',
            'Bonne journee.',
          ]
        ),
      ];

      const result = macro.apply(alignments);

      // Should produce alignments
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

      expect(totalSource).toBe(8);
      expect(totalTarget).toBe(8);
    });

    it('should handle minimal input', () => {
      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
      ];

      const result = macro.apply(alignments);

      expect(result.length).toBe(1);
    });

    it('should handle empty alignment list', () => {
      const result = macro.apply([]);
      expect(result.length).toBe(0);
    });

    it('should fall back to length alignment when not enough best alignments', () => {
      // Very short input where content alignment may not be possible
      const alignments = [
        new Alignment(['A', 'B'], ['X', 'Y']),
      ];

      const result = macro.apply(alignments);

      // Should still produce valid alignments
      expect(result.length).toBeGreaterThan(0);

      const totalSource = result.reduce(
        (sum, a) => sum + a.getSourceSegmentList().length,
        0
      );
      const totalTarget = result.reduce(
        (sum, a) => sum + a.getTargetSegmentList().length,
        0
      );

      expect(totalSource).toBe(2);
      expect(totalTarget).toBe(2);
    });

    it('should assign scores to output alignments', () => {
      const alignments = [
        new Alignment(
          ['First sentence.', 'Second sentence.'],
          ['Premiere phrase.', 'Deuxieme phrase.']
        ),
      ];

      const result = macro.apply(alignments);

      for (const alignment of result) {
        expect(typeof alignment.score).toBe('number');
      }
    });
  });
});

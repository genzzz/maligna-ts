import { Alignment } from '../../../src/core/Alignment';
import { Modifier } from '../../../src/filter/modifier/Modifier';
import { ModifyAlgorithm, NullModifyAlgorithm } from '../../../src/filter/modifier/ModifyAlgorithm';

// Mock algorithm that adds suffix
class SuffixAlgorithm implements ModifyAlgorithm {
  constructor(private suffix: string) {}

  modify(segmentList: readonly string[]): string[] {
    return segmentList.map((s) => s + this.suffix);
  }
}

// Mock algorithm that converts to uppercase
class UppercaseAlgorithm implements ModifyAlgorithm {
  modify(segmentList: readonly string[]): string[] {
    return segmentList.map((s) => s.toUpperCase());
  }
}

describe('Modifier', () => {
  describe('apply with single algorithm', () => {
    it('should apply same algorithm to source and target', () => {
      const algorithm = new SuffixAlgorithm('_mod');
      const modifier = new Modifier(algorithm);

      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
      ];

      const result = modifier.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['Hello_mod']);
      expect(result[0].getTargetSegmentList()).toEqual(['Bonjour_mod']);
    });

    it('should preserve score', () => {
      const modifier = new Modifier(new NullModifyAlgorithm());

      const alignments = [new Alignment(['Test'], ['Test'], 2.5)];

      const result = modifier.apply(alignments);

      expect(result[0].score).toBe(2.5);
    });
  });

  describe('apply with separate algorithms', () => {
    it('should apply different algorithms to source and target', () => {
      const sourceAlgorithm = new SuffixAlgorithm('_S');
      const targetAlgorithm = new SuffixAlgorithm('_T');
      const modifier = new Modifier(sourceAlgorithm, targetAlgorithm);

      const alignments = [
        new Alignment(['Hello'], ['Bonjour']),
      ];

      const result = modifier.apply(alignments);

      expect(result[0].getSourceSegmentList()).toEqual(['Hello_S']);
      expect(result[0].getTargetSegmentList()).toEqual(['Bonjour_T']);
    });

    it('should handle different algorithm types', () => {
      const sourceAlgorithm = new UppercaseAlgorithm();
      const targetAlgorithm = new SuffixAlgorithm('!');
      const modifier = new Modifier(sourceAlgorithm, targetAlgorithm);

      const alignments = [
        new Alignment(['Hello'], ['World']),
      ];

      const result = modifier.apply(alignments);

      expect(result[0].getSourceSegmentList()).toEqual(['HELLO']);
      expect(result[0].getTargetSegmentList()).toEqual(['World!']);
    });
  });

  describe('apply with multiple alignments', () => {
    it('should modify all alignments', () => {
      const modifier = new Modifier(new SuffixAlgorithm('!'));

      const alignments = [
        new Alignment(['One'], ['Un']),
        new Alignment(['Two'], ['Deux']),
        new Alignment(['Three'], ['Trois']),
      ];

      const result = modifier.apply(alignments);

      expect(result.length).toBe(3);
      expect(result[0].getSourceSegmentList()).toEqual(['One!']);
      expect(result[1].getSourceSegmentList()).toEqual(['Two!']);
      expect(result[2].getSourceSegmentList()).toEqual(['Three!']);
    });
  });

  describe('apply with empty inputs', () => {
    it('should handle empty alignment list', () => {
      const modifier = new Modifier(new SuffixAlgorithm('!'));
      const result = modifier.apply([]);
      expect(result.length).toBe(0);
    });

    it('should handle alignments with empty segments', () => {
      const modifier = new Modifier(new SuffixAlgorithm('!'));

      const alignments = [
        new Alignment([], ['Target']),
        new Alignment(['Source'], []),
      ];

      const result = modifier.apply(alignments);

      expect(result[0].getSourceSegmentList()).toEqual([]);
      expect(result[0].getTargetSegmentList()).toEqual(['Target!']);
      expect(result[1].getSourceSegmentList()).toEqual(['Source!']);
      expect(result[1].getTargetSegmentList()).toEqual([]);
    });
  });
});

describe('NullModifyAlgorithm', () => {
  it('should return copy of input unchanged', () => {
    const algorithm = new NullModifyAlgorithm();
    const input = ['Hello', 'World'];
    const result = algorithm.modify(input);

    expect(result).toEqual(['Hello', 'World']);
  });

  it('should return new array', () => {
    const algorithm = new NullModifyAlgorithm();
    const input = ['Test'];
    const result = algorithm.modify(input);

    expect(result).not.toBe(input);
  });

  it('should handle empty input', () => {
    const algorithm = new NullModifyAlgorithm();
    const result = algorithm.modify([]);

    expect(result).toEqual([]);
  });
});

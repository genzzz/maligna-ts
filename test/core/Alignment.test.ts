import { Alignment } from '../../src/core/Alignment';

describe('Alignment', () => {
  describe('constructor', () => {
    it('should create empty alignment with default score', () => {
      const alignment = new Alignment();
      expect(alignment.getSourceSegmentList()).toEqual([]);
      expect(alignment.getTargetSegmentList()).toEqual([]);
      expect(alignment.score).toBe(Alignment.DEFAULT_SCORE);
    });

    it('should create alignment with given segments and default score', () => {
      const alignment = new Alignment(['source1', 'source2'], ['target1']);
      expect(alignment.getSourceSegmentList()).toEqual(['source1', 'source2']);
      expect(alignment.getTargetSegmentList()).toEqual(['target1']);
      expect(alignment.score).toBe(Alignment.DEFAULT_SCORE);
    });

    it('should create alignment with given segments and score', () => {
      const alignment = new Alignment(['source'], ['target'], 1.5);
      expect(alignment.getSourceSegmentList()).toEqual(['source']);
      expect(alignment.getTargetSegmentList()).toEqual(['target']);
      expect(alignment.score).toBe(1.5);
    });

    it('should create a copy of input arrays', () => {
      const source = ['source1'];
      const target = ['target1'];
      const alignment = new Alignment(source, target);
      source.push('source2');
      target.push('target2');
      expect(alignment.getSourceSegmentList()).toEqual(['source1']);
      expect(alignment.getTargetSegmentList()).toEqual(['target1']);
    });
  });

  describe('addSourceSegment', () => {
    it('should add a segment to source list', () => {
      const alignment = new Alignment();
      alignment.addSourceSegment('source1');
      alignment.addSourceSegment('source2');
      expect(alignment.getSourceSegmentList()).toEqual(['source1', 'source2']);
    });
  });

  describe('addSourceSegmentList', () => {
    it('should add multiple segments to source list', () => {
      const alignment = new Alignment(['existing'], []);
      alignment.addSourceSegmentList(['new1', 'new2']);
      expect(alignment.getSourceSegmentList()).toEqual(['existing', 'new1', 'new2']);
    });
  });

  describe('addTargetSegment', () => {
    it('should add a segment to target list', () => {
      const alignment = new Alignment();
      alignment.addTargetSegment('target1');
      alignment.addTargetSegment('target2');
      expect(alignment.getTargetSegmentList()).toEqual(['target1', 'target2']);
    });
  });

  describe('addTargetSegmentList', () => {
    it('should add multiple segments to target list', () => {
      const alignment = new Alignment([], ['existing']);
      alignment.addTargetSegmentList(['new1', 'new2']);
      expect(alignment.getTargetSegmentList()).toEqual(['existing', 'new1', 'new2']);
    });
  });

  describe('getSourceSegmentList', () => {
    it('should return a copy of source segments', () => {
      const alignment = new Alignment(['source'], []);
      const result = alignment.getSourceSegmentList();
      expect(result).toEqual(['source']);
      // Modifying returned array should not affect alignment
      (result as string[]).push('new');
      expect(alignment.getSourceSegmentList()).toEqual(['source']);
    });
  });

  describe('getTargetSegmentList', () => {
    it('should return a copy of target segments', () => {
      const alignment = new Alignment([], ['target']);
      const result = alignment.getTargetSegmentList();
      expect(result).toEqual(['target']);
      // Modifying returned array should not affect alignment
      (result as string[]).push('new');
      expect(alignment.getTargetSegmentList()).toEqual(['target']);
    });
  });

  describe('score', () => {
    it('should get and set score', () => {
      const alignment = new Alignment();
      expect(alignment.score).toBe(0);
      alignment.score = 2.5;
      expect(alignment.score).toBe(2.5);
    });
  });

  describe('getCategory', () => {
    it('should return correct category for 1-1 alignment', () => {
      const alignment = new Alignment(['source'], ['target']);
      const category = alignment.getCategory();
      expect(category.sourceSegmentCount).toBe(1);
      expect(category.targetSegmentCount).toBe(1);
    });

    it('should return correct category for 2-1 alignment', () => {
      const alignment = new Alignment(['s1', 's2'], ['target']);
      const category = alignment.getCategory();
      expect(category.sourceSegmentCount).toBe(2);
      expect(category.targetSegmentCount).toBe(1);
    });

    it('should return correct category for 0-0 alignment', () => {
      const alignment = new Alignment();
      const category = alignment.getCategory();
      expect(category.sourceSegmentCount).toBe(0);
      expect(category.targetSegmentCount).toBe(0);
    });

    it('should return correct category for 1-0 alignment', () => {
      const alignment = new Alignment(['source'], []);
      const category = alignment.getCategory();
      expect(category.sourceSegmentCount).toBe(1);
      expect(category.targetSegmentCount).toBe(0);
    });
  });

  describe('clone', () => {
    it('should create a deep copy', () => {
      const alignment = new Alignment(['source1', 'source2'], ['target'], 1.5);
      const clone = alignment.clone();

      expect(clone.getSourceSegmentList()).toEqual(['source1', 'source2']);
      expect(clone.getTargetSegmentList()).toEqual(['target']);
      expect(clone.score).toBe(1.5);

      // Verify it's a deep copy
      clone.addSourceSegment('new');
      clone.score = 2.0;
      expect(alignment.getSourceSegmentList()).toEqual(['source1', 'source2']);
      expect(alignment.score).toBe(1.5);
    });
  });

  describe('equals', () => {
    it('should return true for equal alignments', () => {
      const a1 = new Alignment(['source'], ['target'], 1.0);
      const a2 = new Alignment(['source'], ['target'], 1.0);
      expect(a1.equals(a2)).toBe(true);
    });

    it('should return false for different scores', () => {
      const a1 = new Alignment(['source'], ['target'], 1.0);
      const a2 = new Alignment(['source'], ['target'], 2.0);
      expect(a1.equals(a2)).toBe(false);
    });

    it('should return false for different source segments', () => {
      const a1 = new Alignment(['source1'], ['target'], 1.0);
      const a2 = new Alignment(['source2'], ['target'], 1.0);
      expect(a1.equals(a2)).toBe(false);
    });

    it('should return false for different target segments', () => {
      const a1 = new Alignment(['source'], ['target1'], 1.0);
      const a2 = new Alignment(['source'], ['target2'], 1.0);
      expect(a1.equals(a2)).toBe(false);
    });

    it('should return false for different segment counts', () => {
      const a1 = new Alignment(['s1', 's2'], ['target'], 1.0);
      const a2 = new Alignment(['s1'], ['target'], 1.0);
      expect(a1.equals(a2)).toBe(false);
    });
  });
});

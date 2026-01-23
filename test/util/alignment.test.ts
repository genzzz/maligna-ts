import { Alignment } from '../../src/core/Alignment';
import {
  mergeStrings,
  alignManyToZero,
  alignZeroToMany,
  alignManyToMany,
  extractSourceSegments,
  extractTargetSegments,
} from '../../src/util/alignment';

describe('alignment utilities', () => {
  describe('mergeStrings', () => {
    it('should return empty string for empty list', () => {
      expect(mergeStrings([])).toBe('');
    });

    it('should return single string unchanged', () => {
      expect(mergeStrings(['hello'])).toBe('hello');
    });

    it('should concatenate multiple strings without separator', () => {
      expect(mergeStrings(['hello', ' ', 'world'])).toBe('hello world');
    });

    it('should concatenate multiple strings directly', () => {
      expect(mergeStrings(['a', 'b', 'c'])).toBe('abc');
    });
  });

  describe('alignManyToZero', () => {
    it('should create alignment with source segments only', () => {
      const result = alignManyToZero(['source1', 'source2']);
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['source1', 'source2']);
      expect(result[0].getTargetSegmentList()).toEqual([]);
    });

    it('should handle empty list', () => {
      const result = alignManyToZero([]);
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual([]);
      expect(result[0].getTargetSegmentList()).toEqual([]);
    });

    it('should handle single segment', () => {
      const result = alignManyToZero(['only']);
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['only']);
    });
  });

  describe('alignZeroToMany', () => {
    it('should create alignment with target segments only', () => {
      const result = alignZeroToMany(['target1', 'target2']);
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual([]);
      expect(result[0].getTargetSegmentList()).toEqual(['target1', 'target2']);
    });

    it('should handle empty list', () => {
      const result = alignZeroToMany([]);
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual([]);
      expect(result[0].getTargetSegmentList()).toEqual([]);
    });

    it('should handle single segment', () => {
      const result = alignZeroToMany(['only']);
      expect(result.length).toBe(1);
      expect(result[0].getTargetSegmentList()).toEqual(['only']);
    });
  });

  describe('alignManyToMany', () => {
    it('should create alignment with both source and target', () => {
      const result = alignManyToMany(['s1', 's2'], ['t1']);
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['s1', 's2']);
      expect(result[0].getTargetSegmentList()).toEqual(['t1']);
      expect(result[0].score).toBe(0);
    });

    it('should handle 1-1 alignment', () => {
      const result = alignManyToMany(['source'], ['target']);
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['source']);
      expect(result[0].getTargetSegmentList()).toEqual(['target']);
    });

    it('should handle empty lists', () => {
      const result = alignManyToMany([], []);
      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual([]);
      expect(result[0].getTargetSegmentList()).toEqual([]);
    });
  });

  describe('extractSourceSegments', () => {
    it('should extract all source segments', () => {
      const alignments = [
        new Alignment(['s1', 's2'], ['t1']),
        new Alignment(['s3'], ['t2', 't3']),
        new Alignment(['s4', 's5', 's6'], []),
      ];
      const result = extractSourceSegments(alignments);
      expect(result).toEqual(['s1', 's2', 's3', 's4', 's5', 's6']);
    });

    it('should return empty array for empty alignment list', () => {
      expect(extractSourceSegments([])).toEqual([]);
    });

    it('should handle alignments with no source segments', () => {
      const alignments = [
        new Alignment([], ['t1']),
        new Alignment(['s1'], ['t2']),
      ];
      const result = extractSourceSegments(alignments);
      expect(result).toEqual(['s1']);
    });

    it('should preserve segment order', () => {
      const alignments = [
        new Alignment(['first'], []),
        new Alignment(['second'], []),
        new Alignment(['third'], []),
      ];
      const result = extractSourceSegments(alignments);
      expect(result).toEqual(['first', 'second', 'third']);
    });
  });

  describe('extractTargetSegments', () => {
    it('should extract all target segments', () => {
      const alignments = [
        new Alignment(['s1'], ['t1', 't2']),
        new Alignment(['s2', 's3'], ['t3']),
        new Alignment([], ['t4', 't5', 't6']),
      ];
      const result = extractTargetSegments(alignments);
      expect(result).toEqual(['t1', 't2', 't3', 't4', 't5', 't6']);
    });

    it('should return empty array for empty alignment list', () => {
      expect(extractTargetSegments([])).toEqual([]);
    });

    it('should handle alignments with no target segments', () => {
      const alignments = [
        new Alignment(['s1'], []),
        new Alignment(['s2'], ['t1']),
      ];
      const result = extractTargetSegments(alignments);
      expect(result).toEqual(['t1']);
    });

    it('should preserve segment order', () => {
      const alignments = [
        new Alignment([], ['first']),
        new Alignment([], ['second']),
        new Alignment([], ['third']),
      ];
      const result = extractTargetSegments(alignments);
      expect(result).toEqual(['first', 'second', 'third']);
    });
  });
});

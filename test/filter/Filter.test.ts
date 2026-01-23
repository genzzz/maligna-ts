import { Alignment } from '../../src/core/Alignment';
import { Filter, CompositeFilter } from '../../src/filter/Filter';

// Mock filter for testing
class MockFilter implements Filter {
  constructor(private readonly suffix: string) {}

  apply(alignmentList: Alignment[]): Alignment[] {
    return alignmentList.map((a) => {
      const newSource = a.getSourceSegmentList().map((s) => s + this.suffix);
      const newTarget = a.getTargetSegmentList().map((t) => t + this.suffix);
      return new Alignment([...newSource], [...newTarget], a.score);
    });
  }
}

// Filter that doubles the alignments
class DoublingFilter implements Filter {
  apply(alignmentList: Alignment[]): Alignment[] {
    return [...alignmentList, ...alignmentList.map((a) => a.clone())];
  }
}

describe('Filter interface', () => {
  it('should be implementable', () => {
    const filter = new MockFilter('_test');
    const alignments = [new Alignment(['Hello'], ['Bonjour'])];
    const result = filter.apply(alignments);

    expect(result.length).toBe(1);
    expect(result[0].getSourceSegmentList()).toEqual(['Hello_test']);
    expect(result[0].getTargetSegmentList()).toEqual(['Bonjour_test']);
  });
});

describe('CompositeFilter', () => {
  describe('apply', () => {
    it('should apply filters in sequence', () => {
      const filter1 = new MockFilter('_1');
      const filter2 = new MockFilter('_2');
      const composite = new CompositeFilter([filter1, filter2]);

      const alignments = [new Alignment(['Hello'], ['Bonjour'])];
      const result = composite.apply(alignments);

      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['Hello_1_2']);
      expect(result[0].getTargetSegmentList()).toEqual(['Bonjour_1_2']);
    });

    it('should handle empty filter list', () => {
      const composite = new CompositeFilter([]);
      const alignments = [new Alignment(['Hello'], ['Bonjour'])];
      const result = composite.apply(alignments);

      expect(result).toEqual(alignments);
    });

    it('should work with single filter', () => {
      const filter = new MockFilter('_only');
      const composite = new CompositeFilter([filter]);

      const alignments = [new Alignment(['Test'], ['Test'])];
      const result = composite.apply(alignments);

      expect(result[0].getSourceSegmentList()).toEqual(['Test_only']);
    });

    it('should handle filter that changes count', () => {
      const doubler = new DoublingFilter();
      const modifier = new MockFilter('_mod');
      const composite = new CompositeFilter([doubler, modifier]);

      const alignments = [new Alignment(['One'], ['Un'])];
      const result = composite.apply(alignments);

      expect(result.length).toBe(2);
      expect(result[0].getSourceSegmentList()).toEqual(['One_mod']);
      expect(result[1].getSourceSegmentList()).toEqual(['One_mod']);
    });

    it('should not modify original filter array', () => {
      const filters = [new MockFilter('_1')];
      const composite = new CompositeFilter(filters);
      filters.push(new MockFilter('_2'));

      const alignments = [new Alignment(['Test'], ['Test'])];
      const result = composite.apply(alignments);

      expect(result[0].getSourceSegmentList()).toEqual(['Test_1']);
    });

    it('should handle empty alignment list', () => {
      const filter = new MockFilter('_test');
      const composite = new CompositeFilter([filter]);

      const result = composite.apply([]);
      expect(result).toEqual([]);
    });

    it('should chain multiple different filters', () => {
      const filter1 = new MockFilter('A');
      const filter2 = new MockFilter('B');
      const filter3 = new MockFilter('C');
      const composite = new CompositeFilter([filter1, filter2, filter3]);

      const alignments = [new Alignment(['X'], ['Y'])];
      const result = composite.apply(alignments);

      expect(result[0].getSourceSegmentList()).toEqual(['XABC']);
      expect(result[0].getTargetSegmentList()).toEqual(['YABC']);
    });
  });
});

import { Category } from '../../../src/core/Category';
import { BEST_CATEGORY_MAP } from '../../../src/core/CategoryDefaults';
import { Calculator } from '../../../src/calculator/Calculator';
import { ViterbiAlgorithm } from '../../../src/filter/aligner/ViterbiAlgorithm';
import { FullMatrixFactory } from '../../../src/matrix/FullMatrix';

// Interface matching ViterbiData from the implementation
interface ViterbiData {
  category: Category;
  score: number;
  totalScore: number;
}

// Simple calculator that returns 0 for equal segments, higher for different
class SimpleCalculator implements Calculator {
  calculateScore(
    sourceSegmentList: readonly string[],
    targetSegmentList: readonly string[]
  ): number {
    const sourceText = sourceSegmentList.join('');
    const targetText = targetSegmentList.join('');
    return Math.abs(sourceText.length - targetText.length);
  }
}

// Calculator that always returns 0 (perfect alignment)
class ZeroCalculator implements Calculator {
  calculateScore(): number {
    return 0;
  }
}

describe('ViterbiAlgorithm', () => {
  const matrixFactory = new FullMatrixFactory<ViterbiData>();

  describe('align', () => {
    it('should align empty segments', () => {
      const calculator = new ZeroCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align([], []);

      expect(result.length).toBe(0);
    });

    it('should create 1-1 alignments for balanced input', () => {
      const calculator = new ZeroCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align(
        ['Hello', 'World'],
        ['Bonjour', 'Monde']
      );

      // Should produce 1-1 alignments as they have highest probability
      expect(result.length).toBe(2);
    });

    it('should align single segments', () => {
      const calculator = new ZeroCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align(['Hello'], ['Bonjour']);

      expect(result.length).toBe(1);
      expect(result[0].getSourceSegmentList()).toEqual(['Hello']);
      expect(result[0].getTargetSegmentList()).toEqual(['Bonjour']);
    });

    it('should handle more source than target segments', () => {
      const calculator = new SimpleCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align(
        ['A', 'B', 'C'],
        ['X', 'Y']
      );

      // Should find alignment - all segments must be accounted for
      const totalSource = result.reduce(
        (sum, a) => sum + a.getSourceSegmentList().length,
        0
      );
      const totalTarget = result.reduce(
        (sum, a) => sum + a.getTargetSegmentList().length,
        0
      );

      expect(totalSource).toBe(3);
      expect(totalTarget).toBe(2);
    });

    it('should handle more target than source segments', () => {
      const calculator = new SimpleCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align(
        ['A', 'B'],
        ['X', 'Y', 'Z']
      );

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

    it('should assign scores to alignments', () => {
      const calculator = new ZeroCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align(['Hello'], ['Bonjour']);

      expect(result[0].score).toBeGreaterThanOrEqual(0);
    });

    it('should handle source-only alignment', () => {
      const calculator = new ZeroCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align(['Hello'], []);

      // Must consume all source segments
      const totalSource = result.reduce(
        (sum, a) => sum + a.getSourceSegmentList().length,
        0
      );
      expect(totalSource).toBe(1);
    });

    it('should handle target-only alignment', () => {
      const calculator = new ZeroCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align([], ['Bonjour']);

      // Must consume all target segments
      const totalTarget = result.reduce(
        (sum, a) => sum + a.getTargetSegmentList().length,
        0
      );
      expect(totalTarget).toBe(1);
    });

    it('should produce valid alignment categories', () => {
      const calculator = new ZeroCalculator();
      const algorithm = new ViterbiAlgorithm(
        calculator,
        BEST_CATEGORY_MAP,
        matrixFactory
      );

      const result = algorithm.align(
        ['A', 'B', 'C'],
        ['X', 'Y', 'Z']
      );

      // All alignments should have valid categories
      for (const alignment of result) {
        const category = alignment.getCategory();
        expect(category.sourceSegmentCount).toBeGreaterThanOrEqual(0);
        expect(category.targetSegmentCount).toBeGreaterThanOrEqual(0);
        expect(
          category.sourceSegmentCount + category.targetSegmentCount
        ).toBeGreaterThan(0);
      }
    });
  });
});

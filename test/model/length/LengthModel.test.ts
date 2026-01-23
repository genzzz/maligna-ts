import { trainLengthModel } from '../../../src/model/length/LengthModel';

describe('LengthModel', () => {
  describe('trainLengthModel', () => {
    it('should create model from length list', () => {
      const model = trainLengthModel([5, 10, 15, 10, 5]);
      expect(model).toBeDefined();
    });

    it('should handle empty length list', () => {
      const model = trainLengthModel([]);
      expect(model.meanLength).toBe(1);
    });

    it('should handle single length', () => {
      const model = trainLengthModel([10]);
      expect(model.meanLength).toBe(10);
    });
  });

  describe('getLengthProbability', () => {
    it('should return probability for seen length', () => {
      const model = trainLengthModel([5, 5, 10, 10, 10]);
      const prob = model.getLengthProbability(5);
      expect(prob).toBeCloseTo(2 / 5, 5);
    });

    it('should return singleton probability for unseen length', () => {
      const model = trainLengthModel([5, 10, 15]);
      const prob = model.getLengthProbability(100);
      expect(prob).toBe(model.singletonLengthProbability);
    });

    it('should return correct probability for common length', () => {
      const model = trainLengthModel([10, 10, 10, 20, 30]);
      const prob10 = model.getLengthProbability(10);
      const prob20 = model.getLengthProbability(20);
      expect(prob10).toBeCloseTo(3 / 5, 5);
      expect(prob20).toBeCloseTo(1 / 5, 5);
    });
  });

  describe('meanLength', () => {
    it('should calculate mean correctly', () => {
      const model = trainLengthModel([10, 20, 30]);
      expect(model.meanLength).toBeCloseTo(20, 5);
    });

    it('should return 1 for empty model', () => {
      const model = trainLengthModel([]);
      expect(model.meanLength).toBe(1);
    });

    it('should handle single value', () => {
      const model = trainLengthModel([42]);
      expect(model.meanLength).toBe(42);
    });

    it('should handle zero lengths', () => {
      const model = trainLengthModel([0, 10, 20]);
      expect(model.meanLength).toBeCloseTo(10, 5);
    });
  });

  describe('singletonLengthProbability', () => {
    it('should be 1 / total count', () => {
      const model = trainLengthModel([5, 10, 15, 20, 25]);
      expect(model.singletonLengthProbability).toBeCloseTo(1 / 5, 5);
    });

    it('should be 1 for empty model', () => {
      const model = trainLengthModel([]);
      expect(model.singletonLengthProbability).toBe(1);
    });

    it('should be 1 for single-element model', () => {
      const model = trainLengthModel([10]);
      expect(model.singletonLengthProbability).toBe(1);
    });
  });
});

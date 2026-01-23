import {
  trainTranslationModel,
  DEFAULT_TRAIN_ITERATION_COUNT,
} from '../../../src/model/translation/TranslationModel';

describe('TranslationModel', () => {
  describe('DEFAULT_TRAIN_ITERATION_COUNT', () => {
    it('should be 5', () => {
      expect(DEFAULT_TRAIN_ITERATION_COUNT).toBe(5);
    });
  });

  describe('trainTranslationModel', () => {
    it('should create model from parallel sentences', () => {
      const sourceWidLists = [[1, 2], [3, 4]];
      const targetWidLists = [[5, 6], [7, 8]];

      const model = trainTranslationModel(3, sourceWidLists, targetWidLists);

      expect(model).toBeDefined();
    });

    it('should throw for mismatched list lengths', () => {
      const sourceWidLists = [[1, 2]];
      const targetWidLists = [[5, 6], [7, 8]];

      expect(() => trainTranslationModel(3, sourceWidLists, targetWidLists)).toThrow(
        'Source and target lists must have same length'
      );
    });

    it('should handle empty parallel lists', () => {
      const model = trainTranslationModel(3, [], []);
      expect(model).toBeDefined();
    });

    it('should handle single sentence pair', () => {
      const sourceWidLists = [[1, 2, 3]];
      const targetWidLists = [[4, 5]];

      const model = trainTranslationModel(3, sourceWidLists, targetWidLists);

      // Model should exist and have data for source words
      expect(model.get(1)).toBeDefined();
      expect(model.get(2)).toBeDefined();
      expect(model.get(3)).toBeDefined();
    });
  });

  describe('translation probabilities', () => {
    it('should have probabilities for seen word pairs', () => {
      const sourceWidLists = [[1], [1]];
      const targetWidLists = [[2], [2]];

      const model = trainTranslationModel(5, sourceWidLists, targetWidLists);
      const sourceData = model.get(1);

      expect(sourceData).toBeDefined();
      expect(sourceData!.getTranslationProbability(2)).toBeGreaterThan(0);
    });

    it('should return 0 for unseen translation', () => {
      const sourceWidLists = [[1]];
      const targetWidLists = [[2]];

      const model = trainTranslationModel(5, sourceWidLists, targetWidLists);
      const sourceData = model.get(1);

      expect(sourceData!.getTranslationProbability(999)).toBe(0);
    });

    it('should return undefined for unseen source word', () => {
      const sourceWidLists = [[1]];
      const targetWidLists = [[2]];

      const model = trainTranslationModel(5, sourceWidLists, targetWidLists);

      expect(model.get(999)).toBeUndefined();
    });

    it('should distribute probability among multiple targets', () => {
      const sourceWidLists = [[1], [1]];
      const targetWidLists = [[2], [3]];

      const model = trainTranslationModel(5, sourceWidLists, targetWidLists);
      const sourceData = model.get(1);

      const prob2 = sourceData!.getTranslationProbability(2);
      const prob3 = sourceData!.getTranslationProbability(3);

      expect(prob2).toBeGreaterThan(0);
      expect(prob3).toBeGreaterThan(0);
      expect(prob2 + prob3).toBeCloseTo(1, 1);
    });

    it('should converge with more iterations', () => {
      const sourceWidLists = [[1, 2], [1]];
      const targetWidLists = [[3, 4], [3]];

      const model1 = trainTranslationModel(1, sourceWidLists, targetWidLists);
      const model5 = trainTranslationModel(5, sourceWidLists, targetWidLists);

      // Both should have data, values may differ
      expect(model1.get(1)).toBeDefined();
      expect(model5.get(1)).toBeDefined();
    });
  });

  describe('getTargetData', () => {
    it('should return all target probabilities', () => {
      const sourceWidLists = [[1]];
      const targetWidLists = [[2, 3, 4]];

      const model = trainTranslationModel(5, sourceWidLists, targetWidLists);
      const sourceData = model.get(1);
      const targetData = sourceData!.getTargetData();

      expect(targetData.size).toBe(3);
      expect(targetData.has(2)).toBe(true);
      expect(targetData.has(3)).toBe(true);
      expect(targetData.has(4)).toBe(true);
    });
  });
});

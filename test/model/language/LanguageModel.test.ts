import {
  trainLanguageModel,
  trainLanguageModelFromSentences,
} from '../../../src/model/language/LanguageModel';

describe('LanguageModel', () => {
  describe('trainLanguageModel', () => {
    it('should create model from wid list', () => {
      const model = trainLanguageModel([1, 2, 3, 2, 1]);
      expect(model).toBeDefined();
    });

    it('should handle empty list', () => {
      const model = trainLanguageModel([]);
      expect(model.singletonWordProbability).toBe(1);
    });
  });

  describe('getWordProbability', () => {
    it('should return probability for seen word', () => {
      const model = trainLanguageModel([1, 1, 2, 2, 2]);
      expect(model.getWordProbability(1)).toBeCloseTo(2 / 5, 5);
      expect(model.getWordProbability(2)).toBeCloseTo(3 / 5, 5);
    });

    it('should return singleton probability for unseen word', () => {
      const model = trainLanguageModel([1, 2, 3]);
      const prob = model.getWordProbability(100);
      expect(prob).toBe(model.singletonWordProbability);
    });

    it('should handle single occurrence', () => {
      const model = trainLanguageModel([1, 2, 3]);
      expect(model.getWordProbability(1)).toBeCloseTo(1 / 3, 5);
    });
  });

  describe('singletonWordProbability', () => {
    it('should be 1 / total count', () => {
      const model = trainLanguageModel([1, 2, 3, 4, 5]);
      expect(model.singletonWordProbability).toBeCloseTo(1 / 5, 5);
    });

    it('should be 1 for empty model', () => {
      const model = trainLanguageModel([]);
      expect(model.singletonWordProbability).toBe(1);
    });

    it('should be 1 for single word model', () => {
      const model = trainLanguageModel([42]);
      expect(model.singletonWordProbability).toBe(1);
    });
  });
});

describe('trainLanguageModelFromSentences', () => {
  it('should create model from multiple sentences', () => {
    const sentences = [
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ];
    const model = trainLanguageModelFromSentences(sentences);
    expect(model).toBeDefined();
  });

  it('should count all words across sentences', () => {
    const sentences = [
      [1, 2],
      [2, 3],
    ];
    const model = trainLanguageModelFromSentences(sentences);
    // Total 4 words: 1 appears once, 2 appears twice, 3 appears once
    expect(model.getWordProbability(1)).toBeCloseTo(1 / 4, 5);
    expect(model.getWordProbability(2)).toBeCloseTo(2 / 4, 5);
    expect(model.getWordProbability(3)).toBeCloseTo(1 / 4, 5);
  });

  it('should handle empty sentence list', () => {
    const model = trainLanguageModelFromSentences([]);
    expect(model.singletonWordProbability).toBe(1);
  });

  it('should handle empty sentences', () => {
    const model = trainLanguageModelFromSentences([[], [1], []]);
    expect(model.getWordProbability(1)).toBe(1);
  });
});

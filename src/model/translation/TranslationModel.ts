/**
 * Translation data for a source word containing probabilities to target words.
 */
export interface SourceData {
  /**
   * Get translation probability to a target word.
   */
  getTranslationProbability(targetWid: number): number;

  /**
   * Get all target word ids with their probabilities.
   */
  getTargetData(): Map<number, number>;
}

/**
 * Represents translation model - a probabilistic dictionary storing
 * source word translations to target words with probabilities.
 * This implements IBM Model 1.
 */
export interface TranslationModel {
  /**
   * Get translation data for a source word.
   */
  get(sourceWid: number): SourceData | undefined;
}

/**
 * Default number of training iterations for IBM Model 1.
 */
export const DEFAULT_TRAIN_ITERATION_COUNT = 5;

/**
 * Mutable source data for training.
 */
class MutableSourceData implements SourceData {
  private targetProbabilities: Map<number, number> = new Map();

  setTranslationProbability(targetWid: number, probability: number): void {
    this.targetProbabilities.set(targetWid, probability);
  }

  getTranslationProbability(targetWid: number): number {
    return this.targetProbabilities.get(targetWid) || 0;
  }

  getTargetData(): Map<number, number> {
    return new Map(this.targetProbabilities);
  }
}

/**
 * Mutable translation model for training.
 */
class MutableTranslationModel implements TranslationModel {
  private sourceData: Map<number, MutableSourceData> = new Map();

  getOrCreate(sourceWid: number): MutableSourceData {
    let data = this.sourceData.get(sourceWid);
    if (!data) {
      data = new MutableSourceData();
      this.sourceData.set(sourceWid, data);
    }
    return data;
  }

  get(sourceWid: number): SourceData | undefined {
    return this.sourceData.get(sourceWid);
  }
}

/**
 * Train a translation model using IBM Model 1 EM algorithm.
 *
 * @param iterationCount Number of EM iterations
 * @param sourceWidLists List of source sentences (each sentence is list of wids)
 * @param targetWidLists List of target sentences (parallel to source)
 */
export function trainTranslationModel(
  iterationCount: number,
  sourceWidLists: number[][],
  targetWidLists: number[][]
): TranslationModel {
  if (sourceWidLists.length !== targetWidLists.length) {
    throw new Error('Source and target lists must have same length');
  }

  const model = new MutableTranslationModel();

  // Initialize with uniform probabilities
  initializeUniform(model, sourceWidLists, targetWidLists);

  // EM iterations
  for (let iter = 0; iter < iterationCount; iter++) {
    const counts = new Map<number, Map<number, number>>();
    const totals = new Map<number, number>();

    // E-step: compute expected counts
    for (let i = 0; i < sourceWidLists.length; i++) {
      const sourceWids = sourceWidLists[i];
      const targetWids = targetWidLists[i];

      for (const targetWid of targetWids) {
        // Compute normalization factor
        let norm = 0;
        for (const sourceWid of sourceWids) {
          const sourceData = model.get(sourceWid);
          const prob = sourceData?.getTranslationProbability(targetWid) || 0;
          norm += prob;
        }

        if (norm > 0) {
          // Collect counts
          for (const sourceWid of sourceWids) {
            const sourceData = model.get(sourceWid);
            const prob = sourceData?.getTranslationProbability(targetWid) || 0;
            const delta = prob / norm;

            // Add to counts
            if (!counts.has(sourceWid)) {
              counts.set(sourceWid, new Map());
            }
            const sourceCounts = counts.get(sourceWid)!;
            sourceCounts.set(
              targetWid,
              (sourceCounts.get(targetWid) || 0) + delta
            );
            totals.set(sourceWid, (totals.get(sourceWid) || 0) + delta);
          }
        }
      }
    }

    // M-step: update probabilities
    for (const [sourceWid, targetCounts] of counts) {
      const total = totals.get(sourceWid) || 1;
      const sourceData = model.getOrCreate(sourceWid);
      for (const [targetWid, count] of targetCounts) {
        sourceData.setTranslationProbability(targetWid, count / total);
      }
    }
  }

  return model;
}

/**
 * Initialize model with uniform probabilities.
 */
function initializeUniform(
  model: MutableTranslationModel,
  sourceWidLists: number[][],
  targetWidLists: number[][]
): void {
  // Collect all unique target words
  const targetVocab = new Set<number>();
  for (const targetWids of targetWidLists) {
    for (const wid of targetWids) {
      targetVocab.add(wid);
    }
  }
  const targetVocabSize = targetVocab.size || 1;
  const uniformProb = 1.0 / targetVocabSize;

  // Initialize all source words with uniform probability to all target words
  for (let i = 0; i < sourceWidLists.length; i++) {
    const sourceWids = sourceWidLists[i];
    const targetWids = targetWidLists[i];

    for (const sourceWid of sourceWids) {
      const sourceData = model.getOrCreate(sourceWid);
      for (const targetWid of targetWids) {
        sourceData.setTranslationProbability(targetWid, uniformProb);
      }
    }
  }
}

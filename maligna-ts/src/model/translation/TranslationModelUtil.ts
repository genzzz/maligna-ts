import {
  TranslationModel,
  InitialTranslationModel,
  MutableTranslationModel,
  MutableSourceData,
} from './TranslationModel.js';
import { Vocabulary } from '../vocabulary/Vocabulary.js';

export const DEFAULT_TRAIN_ITERATION_COUNT = 4;

/**
 * Trains translation model using given source and target segments
 * (training corpus).
 * These source and target segment lists must have the same number of
 * segments (in other words they must be aligned one-to-one).
 *
 * @see "The Mathematics of Statistical Machine Translation: Parameter Estimation,
 *     Brown, P. F., Della Pietra S. A., Della Pietra, V. J., Mercer, R. L."
 */
export function trainTranslationModel(
  iterationCount: number,
  sourceSegmentList: readonly (readonly number[])[],
  targetSegmentList: readonly (readonly number[])[],
  targetVocabularySize: number = 1
): TranslationModel {
  if (sourceSegmentList.length !== targetSegmentList.length) {
    throw new Error('Source and target segment lists must have the same length');
  }
  if (iterationCount < 1) {
    throw new Error('Iteration count must be >= 1');
  }

  let model: TranslationModel = new InitialTranslationModel(targetVocabularySize);
  let newModel: MutableTranslationModel | null = null;

  for (let iteration = 0; iteration < iterationCount; ++iteration) {
    newModel = performTrainingIteration(
      model,
      sourceSegmentList,
      targetSegmentList,
      targetVocabularySize
    );
    model = newModel;
  }

  if (newModel) {
    newModel.sort();
  }

  return newModel ?? model;
}

/**
 * Performs single translation model training iteration (EM algorithm).
 */
function performTrainingIteration(
  model: TranslationModel,
  sourceSegmentList: readonly (readonly number[])[],
  targetSegmentList: readonly (readonly number[])[],
  targetVocabularySize: number
): MutableTranslationModel {
  const newModel = new MutableTranslationModel(targetVocabularySize);

  for (let i = 0; i < sourceSegmentList.length; i++) {
    const sourceSegment = sourceSegmentList[i];
    const targetSegment = targetSegmentList[i];

    if (!sourceSegment || !targetSegment) continue;

    // Add NULL word to source segment
    const sourceSegmentAndNull = [...sourceSegment, Vocabulary.NULL_WID];

    for (const targetWid of targetSegment) {
      // E-step: calculate probability sum
      let probabilitySum = 0;
      for (const sourceWid of sourceSegmentAndNull) {
        probabilitySum += model.get(sourceWid).getTranslationProbability(targetWid);
      }

      if (probabilitySum <= 0) continue;

      // M-step: update counts
      const minProbabilityChange = 1.0 / sourceSegmentAndNull.length;

      for (const sourceWid of sourceSegmentAndNull) {
        const oldModelProbability = model
          .get(sourceWid)
          .getTranslationProbability(targetWid);
        const probabilityChange = oldModelProbability / probabilitySum;

        let newModelData: MutableSourceData;
        if (probabilityChange >= minProbabilityChange) {
          newModelData = newModel.getMutable(sourceWid);
        } else {
          newModelData = newModel.getMutable(Vocabulary.NULL_WID);
        }

        const newModelProbability =
          newModelData.getTranslationProbability(targetWid);
        newModelData.setTranslationProbability(
          targetWid,
          newModelProbability + probabilityChange
        );
      }
    }
  }

  newModel.normalize();
  return newModel;
}

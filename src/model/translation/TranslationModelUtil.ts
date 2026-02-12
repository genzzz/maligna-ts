import { TranslationModel } from './TranslationModel';
import { MutableTranslationModel, InitialTranslationModel, MutableSourceData } from './MutableTranslationModel';
import { Vocabulary } from '../vocabulary/Vocabulary';

export const DEFAULT_TRAIN_ITERATION_COUNT = 4;

/**
 * Trains a translation model using IBM Model 1 EM algorithm.
 *
 * @param iterationCount number of EM iterations
 * @param sourceSegmentList source segment word ID lists (aligned one-to-one with target)
 * @param targetSegmentList target segment word ID lists
 * @returns trained translation model
 */
export function trainTranslationModel(
  iterationCount: number,
  sourceSegmentList: number[][],
  targetSegmentList: number[][]
): TranslationModel {
  let model: TranslationModel = new InitialTranslationModel();
  let newModel: MutableTranslationModel | null = null;

  for (let iteration = 0; iteration < iterationCount; iteration++) {
    newModel = performTrainingIteration(model, sourceSegmentList, targetSegmentList);
    model = newModel;
  }

  newModel!.sort();
  return newModel!;
}

/**
 * Trains with default iteration count.
 */
export function trainTranslationModelDefault(
  sourceSegmentList: number[][],
  targetSegmentList: number[][]
): TranslationModel {
  return trainTranslationModel(
    DEFAULT_TRAIN_ITERATION_COUNT,
    sourceSegmentList,
    targetSegmentList
  );
}

/**
 * Performs a single IBM Model 1 EM training iteration.
 */
function performTrainingIteration(
  model: TranslationModel,
  sourceSegmentList: number[][],
  targetSegmentList: number[][]
): MutableTranslationModel {
  const newModel = new MutableTranslationModel();

  for (let s = 0; s < sourceSegmentList.length; s++) {
    const sourceSegment = sourceSegmentList[s];
    // Add NULL word to source segment
    const sourceSegmentAndNull = [...sourceSegment, Vocabulary.NULL_WID];
    const targetSegment = targetSegmentList[s];

    for (const targetWid of targetSegment) {
      let probabilitySum = 0;

      for (const sourceWid of sourceSegmentAndNull) {
        probabilitySum += model.get(sourceWid).getTranslationProbability(targetWid);
      }

      // Moore optimization threshold
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

/**
 * Parses a translation model from text format.
 * Each line: sourceWord\ttargetWord\tprobability
 */
export function parseTranslationModel(
  text: string,
  sourceVocabulary: Vocabulary,
  targetVocabulary: Vocabulary
): TranslationModel {
  const translationModel = new MutableTranslationModel();
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length === 3) {
      const sourceWord = parts[0];
      const targetWord = parts[1];
      const probability = parseFloat(parts[2]);

      const sourceWid = sourceVocabulary.putWord(sourceWord);
      const targetWid = targetVocabulary.putWord(targetWord);

      const sourceData = translationModel.getMutable(sourceWid);
      sourceData.setTranslationProbability(targetWid, probability);
    } else if (parts.length !== 0) {
      throw new Error('Bad number of line parts in translation model.');
    }
  }

  translationModel.normalize();
  translationModel.sort();
  return translationModel;
}

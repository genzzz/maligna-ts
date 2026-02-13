import { MutableLengthModel, type LengthModel } from './LengthModel';

/**
 * Trains a length model from a list of segment lengths.
 */
export function trainLengthModel(segmentLengthList: number[]): LengthModel {
  const model = new MutableLengthModel();
  for (const length of segmentLengthList) {
    model.addLength(length);
  }
  model.normalize();
  return model;
}

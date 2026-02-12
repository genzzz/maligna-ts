import { Alignment } from '../../../coretypes/Alignment';

/**
 * AlignAlgorithm interface — aligns source and target segments.
 */
export interface AlignAlgorithm {
  align(sourceSegmentList: string[], targetSegmentList: string[]): Alignment[];
}

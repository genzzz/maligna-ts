/**
 * ModifyAlgorithm interface — transforms a segment list.
 */
export interface ModifyAlgorithm {
  modify(segmentList: string[]): string[];
}

/**
 * Null modify algorithm — returns segments unchanged.
 */
export class NullModifyAlgorithm implements ModifyAlgorithm {
  modify(segmentList: string[]): string[] {
    return [...segmentList];
  }
}

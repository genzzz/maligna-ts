/**
 * Responsible for calculating length of given segment. For example
 * it can return number of characters (see CharCounter),
 * number of words (see SplitCounter) or any other measure.
 */
export interface Counter {
  /**
   * Calculates length of a segment.
   *
   * @param segment segment
   * @returns length of a segment, >= 0
   */
  calculateLength(segment: string): number;
}

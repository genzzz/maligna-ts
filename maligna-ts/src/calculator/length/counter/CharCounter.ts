import { Counter } from './Counter.js';

/**
 * Responsible for calculating length of a segment in characters.
 */
export class CharCounter implements Counter {
  /**
   * Returns segment length.
   */
  calculateLength(segment: string): number {
    return segment.length;
  }
}

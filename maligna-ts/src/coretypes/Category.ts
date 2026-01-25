/**
 * Represents alignment category - for example one source segment to
 * one target segment (1-1), two source segments to zero target segments (2-0),
 * etc.
 *
 * Immutable - cannot be modified once it is created.
 */
export class Category {
  private readonly _sourceSegmentCount: number;
  private readonly _targetSegmentCount: number;

  constructor(sourceSegmentCount: number, targetSegmentCount: number) {
    this._sourceSegmentCount = sourceSegmentCount;
    this._targetSegmentCount = targetSegmentCount;
  }

  /**
   * @returns Count of source segments in this category.
   */
  get sourceSegmentCount(): number {
    return this._sourceSegmentCount;
  }

  /**
   * @returns Count of target segments in this category.
   */
  get targetSegmentCount(): number {
    return this._targetSegmentCount;
  }

  toString(): string {
    return `(${this._sourceSegmentCount}-${this._targetSegmentCount})`;
  }

  /**
   * Creates a unique key for use in Maps.
   */
  toKey(): string {
    return `${this._sourceSegmentCount}-${this._targetSegmentCount}`;
  }

  equals(other: Category): boolean {
    return (
      this._sourceSegmentCount === other._sourceSegmentCount &&
      this._targetSegmentCount === other._targetSegmentCount
    );
  }
}

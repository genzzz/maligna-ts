/**
 * Represents alignment category - for example one source segment to
 * one target segment (1-1), two source segments to zero target segments (2-0), etc.
 *
 * Immutable - cannot be modified once created.
 */
export class Category {
  readonly sourceSegmentCount: number;
  readonly targetSegmentCount: number;

  constructor(sourceSegmentCount: number, targetSegmentCount: number) {
    this.sourceSegmentCount = sourceSegmentCount;
    this.targetSegmentCount = targetSegmentCount;
  }

  toString(): string {
    return `(${this.sourceSegmentCount}-${this.targetSegmentCount})`;
  }

  equals(other: Category): boolean {
    return (
      this.sourceSegmentCount === other.sourceSegmentCount &&
      this.targetSegmentCount === other.targetSegmentCount
    );
  }

  /**
   * Creates a unique key for use in Maps
   */
  toKey(): string {
    return `${this.sourceSegmentCount}-${this.targetSegmentCount}`;
  }

  /**
   * Creates a Category from a key string
   */
  static fromKey(key: string): Category {
    const [source, target] = key.split('-').map(Number);
    return new Category(source, target);
  }
}

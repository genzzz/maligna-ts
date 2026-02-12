/**
 * Represents alignment category defined by source and target segment counts.
 * For example (1-1) means one source to one target, (2-1) means two source to one target.
 */
export class Category {
  public readonly sourceSegmentCount: number;
  public readonly targetSegmentCount: number;

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
   * Returns a string key for use in Maps (since JS Maps use reference equality for objects).
   */
  toKey(): string {
    return `${this.sourceSegmentCount}-${this.targetSegmentCount}`;
  }

  /**
   * Returns a numeric key for fast Map lookups. Supports counts 0-9.
   */
  toNumericKey(): number {
    return this.sourceSegmentCount * 10 + this.targetSegmentCount;
  }
}

import { Category } from './Category.js';

/**
 * Represents a mapping of n segments in source text to m segments in target text.
 * Responsible for storing the segment contents and alignment score equal to
 * -ln(probability).
 */
export class Alignment {
  static readonly DEFAULT_SCORE = 0.0;

  private sourceSegmentList: string[];
  private targetSegmentList: string[];
  private _score: number;

  /**
   * Creates empty alignment (0-0) with default score equal to DEFAULT_SCORE.
   */
  constructor();
  /**
   * Creates alignment of given lists with given score.
   */
  constructor(
    sourceSegmentList: string[],
    targetSegmentList: string[],
    score?: number
  );
  constructor(
    sourceSegmentList?: string[],
    targetSegmentList?: string[],
    score: number = Alignment.DEFAULT_SCORE
  ) {
    this.sourceSegmentList = sourceSegmentList ? [...sourceSegmentList] : [];
    this.targetSegmentList = targetSegmentList ? [...targetSegmentList] : [];
    this._score = score;
  }

  /**
   * Adds a segment to source segment list.
   */
  addSourceSegment(segment: string): void {
    this.sourceSegmentList.push(segment);
  }

  /**
   * Adds a list of segments to source segment list.
   */
  addSourceSegmentList(segmentList: string[]): void {
    this.sourceSegmentList.push(...segmentList);
  }

  /**
   * Adds a segment to target segment list.
   */
  addTargetSegment(segment: string): void {
    this.targetSegmentList.push(segment);
  }

  /**
   * Adds a list of segments to target segment list.
   */
  addTargetSegmentList(segmentList: string[]): void {
    this.targetSegmentList.push(...segmentList);
  }

  /**
   * Returns a copy of the source segment list.
   */
  getSourceSegmentList(): readonly string[] {
    return [...this.sourceSegmentList];
  }

  /**
   * Returns a copy of the target segment list.
   */
  getTargetSegmentList(): readonly string[] {
    return [...this.targetSegmentList];
  }

  /**
   * Returns alignment score.
   */
  get score(): number {
    return this._score;
  }

  /**
   * Sets alignment score.
   */
  set score(value: number) {
    this._score = value;
  }

  /**
   * Retrieves alignment category (1-1, 2-1, etc.)
   */
  getCategory(): Category {
    return new Category(
      this.sourceSegmentList.length,
      this.targetSegmentList.length
    );
  }

  /**
   * Creates a deep copy of this alignment.
   */
  clone(): Alignment {
    return new Alignment(
      [...this.sourceSegmentList],
      [...this.targetSegmentList],
      this._score
    );
  }

  equals(other: Alignment): boolean {
    if (this._score !== other._score) return false;
    if (this.sourceSegmentList.length !== other.sourceSegmentList.length)
      return false;
    if (this.targetSegmentList.length !== other.targetSegmentList.length)
      return false;
    for (let i = 0; i < this.sourceSegmentList.length; i++) {
      if (this.sourceSegmentList[i] !== other.sourceSegmentList[i])
        return false;
    }
    for (let i = 0; i < this.targetSegmentList.length; i++) {
      if (this.targetSegmentList[i] !== other.targetSegmentList[i])
        return false;
    }
    return true;
  }
}

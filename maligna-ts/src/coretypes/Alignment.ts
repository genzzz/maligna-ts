import { Category } from './Category.js';

/**
 * Represents a mapping of n segments in source text to m segments in target text.
 * Responsible for storing the segment contents and alignment score equal to
 * -ln(probability).
 */
export class Alignment {
  public static readonly DEFAULT_SCORE = 0.0;

  private readonly _sourceSegmentList: string[];
  private readonly _targetSegmentList: string[];
  private _score: number;

  /**
   * Creates empty alignment (0 - 0) with default score equal to DEFAULT_SCORE.
   */
  constructor();
  /**
   * Creates alignment of a given list of source segments to a given list
   * of target segments with a given score.
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
    this._sourceSegmentList = sourceSegmentList ? [...sourceSegmentList] : [];
    this._targetSegmentList = targetSegmentList ? [...targetSegmentList] : [];
    this._score = score;
  }

  /**
   * Adds a segment to source segment list.
   */
  addSourceSegment(segment: string): void {
    this._sourceSegmentList.push(segment);
  }

  /**
   * Adds a list of segments to source segment list.
   */
  addSourceSegmentList(segmentList: string[]): void {
    this._sourceSegmentList.push(...segmentList);
  }

  /**
   * Adds a segment to target segment list.
   */
  addTargetSegment(segment: string): void {
    this._targetSegmentList.push(segment);
  }

  /**
   * Adds a list of segments to target segment list.
   */
  addTargetSegmentList(segmentList: string[]): void {
    this._targetSegmentList.push(...segmentList);
  }

  /**
   * @returns Returns a copy of source segment list
   */
  get sourceSegmentList(): readonly string[] {
    return this._sourceSegmentList;
  }

  /**
   * @returns Returns a copy of target segment list
   */
  get targetSegmentList(): readonly string[] {
    return this._targetSegmentList;
  }

  /**
   * @returns Returns alignment score.
   */
  get score(): number {
    return this._score;
  }

  /**
   * Sets alignment score
   */
  set score(score: number) {
    this._score = score;
  }

  /**
   * Retrieves alignment category (1-1, 2-1, etc.)
   */
  getCategory(): Category {
    return new Category(
      this._sourceSegmentList.length,
      this._targetSegmentList.length
    );
  }

  /**
   * Retrieves alignment category (1-1, 2-1, etc.)
   */
  get category(): Category {
    return this.getCategory();
  }

  equals(other: Alignment): boolean {
    if (this._sourceSegmentList.length !== other._sourceSegmentList.length) {
      return false;
    }
    if (this._targetSegmentList.length !== other._targetSegmentList.length) {
      return false;
    }
    for (let i = 0; i < this._sourceSegmentList.length; i++) {
      if (this._sourceSegmentList[i] !== other._sourceSegmentList[i]) {
        return false;
      }
    }
    for (let i = 0; i < this._targetSegmentList.length; i++) {
      if (this._targetSegmentList[i] !== other._targetSegmentList[i]) {
        return false;
      }
    }
    return true;
  }
}

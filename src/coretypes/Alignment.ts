import { Category } from './Category';

/**
 * Represents a single alignment between source and target segments.
 * Core data type used throughout the system.
 */
export class Alignment {
  public static readonly DEFAULT_SCORE = 0.0;

  public readonly sourceSegmentList: string[];
  public readonly targetSegmentList: string[];
  public readonly score: number;

  constructor(
    sourceSegmentList: string[],
    targetSegmentList: string[],
    score: number = Alignment.DEFAULT_SCORE
  ) {
    this.sourceSegmentList = sourceSegmentList;
    this.targetSegmentList = targetSegmentList;
    this.score = score;
  }

  getCategory(): Category {
    return new Category(
      this.sourceSegmentList.length,
      this.targetSegmentList.length
    );
  }

  equals(other: Alignment): boolean {
    if (this.sourceSegmentList.length !== other.sourceSegmentList.length) return false;
    if (this.targetSegmentList.length !== other.targetSegmentList.length) return false;
    for (let i = 0; i < this.sourceSegmentList.length; i++) {
      if (this.sourceSegmentList[i] !== other.sourceSegmentList[i]) return false;
    }
    for (let i = 0; i < this.targetSegmentList.length; i++) {
      if (this.targetSegmentList[i] !== other.targetSegmentList[i]) return false;
    }
    return true;
  }

  hashCode(): number {
    let hash = 17;
    for (const s of this.sourceSegmentList) {
      hash = (hash * 31 + stringHash(s)) | 0;
    }
    for (const s of this.targetSegmentList) {
      hash = (hash * 31 + stringHash(s)) | 0;
    }
    return hash;
  }

  toString(): string {
    const sourceStr = this.sourceSegmentList.join(', ');
    const targetStr = this.targetSegmentList.join(', ');
    return `Alignment(source=[${sourceStr}], target=[${targetStr}], score=${this.score})`;
  }
}

function stringHash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return hash;
}

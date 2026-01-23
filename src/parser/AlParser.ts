import { Alignment } from '../core/Alignment.js';
import { Parser } from './Parser.js';

/**
 * Interface for alignment data in .al format
 */
interface AlignmentData {
  score: number;
  sourceSegments: string[];
  targetSegments: string[];
}

interface AlignmentListData {
  alignments: AlignmentData[];
}

/**
 * Parser for native .al format (JSON-based).
 */
export class AlParser implements Parser {
  private readonly content: string;

  constructor(content: string) {
    this.content = content;
  }

  parse(): Alignment[] {
    const data: AlignmentListData = JSON.parse(this.content);
    return data.alignments.map(
      (a) => new Alignment(a.sourceSegments, a.targetSegments, a.score)
    );
  }
}

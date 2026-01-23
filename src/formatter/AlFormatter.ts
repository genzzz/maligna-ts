import { Alignment } from '../core/Alignment.js';
import { Formatter } from './Formatter.js';

/**
 * Formatter for native .al format (JSON-based).
 * Preserves all information about alignments including scores.
 */
export class AlFormatter implements Formatter {
  format(alignmentList: Alignment[]): string {
    const data = {
      alignments: alignmentList.map((alignment) => ({
        score: alignment.score,
        sourceSegments: [...alignment.getSourceSegmentList()],
        targetSegments: [...alignment.getTargetSegmentList()],
      })),
    };
    return JSON.stringify(data, null, 2);
  }
}

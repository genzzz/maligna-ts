import { XMLBuilder } from 'fast-xml-parser';
import { Alignment } from '../coretypes/index.js';
import { Formatter } from './Formatter.js';

/**
 * Represents formatter to native .AL format.
 * 
 * This format preserves all information about alignments including scores.
 */
export class AlFormatter implements Formatter {
  /**
   * Formats alignments to XML string preserving all parameters.
   */
  format(alignmentList: Alignment[]): string {
    const alignments = alignmentList.map(alignment => ({
      '@_score': alignment.score,
      sourcelist: {
        segment: alignment.sourceSegmentList,
      },
      targetlist: {
        segment: alignment.targetSegmentList,
      },
    }));

    const doc = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
        '@_standalone': 'yes',
      },
      alignmentlist: {
        alignment: alignments,
      },
    };

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      indentBy: '    ',
      suppressEmptyNode: false,
    });

    return builder.build(doc);
  }
}

import { XMLParser } from 'fast-xml-parser';
import { Alignment } from '../coretypes/index.js';
import { Parser } from './Parser.js';

/**
 * Interface representing the parsed AL XML structure.
 */
interface AlSegmentList {
  segment?: string | string[];
}

interface AlAlignmentElement {
  sourcelist: AlSegmentList;
  targetlist: AlSegmentList;
  score?: number;
}

interface AlAlignmentList {
  alignment?: AlAlignmentElement | AlAlignmentElement[];
}

interface AlDocument {
  alignmentlist: AlAlignmentList;
}

/**
 * Represents parser of a native .al format.
 * Parses a document configured in constructor.
 */
export class AlParser implements Parser {
  private content: string;

  /**
   * Constructs parser.
   * @param content XML content to be parsed
   */
  constructor(content: string) {
    this.content = content;
  }

  /**
   * Parses a document into a list of alignments.
   * Retrieves all information stored in this format including score.
   */
  parse(): Alignment[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '_text',
      isArray: (name) => name === 'alignment' || name === 'segment',
    });

    const doc: AlDocument = parser.parse(this.content);
    const alignmentList: Alignment[] = [];

    const alignments = doc.alignmentlist?.alignment;
    if (!alignments) {
      return alignmentList;
    }

    const alignmentArray = Array.isArray(alignments) ? alignments : [alignments];

    for (const a of alignmentArray) {
      const sourceSegmentList = this.createSegmentList(a.sourcelist);
      const targetSegmentList = this.createSegmentList(a.targetlist);
      const score = a.score !== undefined ? Number(a.score) : 0;
      const alignment = new Alignment(sourceSegmentList, targetSegmentList, score);
      alignmentList.push(alignment);
    }

    return alignmentList;
  }

  private createSegmentList(sl: AlSegmentList | undefined): string[] {
    if (!sl || !sl.segment) {
      return [];
    }
    const segments = sl.segment;
    if (Array.isArray(segments)) {
      return segments.map(s => String(s));
    }
    return [String(segments)];
  }
}

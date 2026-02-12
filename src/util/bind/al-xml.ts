import { XMLParser, XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';
import { Alignment } from '../../coretypes/Alignment';

/**
 * Parses .al XML format into Alignment array.
 *
 * Format:
 * <alignmentlist>
 *   <alignment score="0.5">
 *     <sourcelist><segment>text</segment></sourcelist>
 *     <targetlist><segment>text</segment></targetlist>
 *   </alignment>
 * </alignmentlist>
 */
export function parseAl(xml: string): Alignment[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name: string) => {
      return name === 'alignment' || name === 'segment';
    },
    // Preserve whitespace in segment text
    trimValues: false,
    // Prevent auto-conversion of tag text to numbers (e.g. "0." → 0)
    parseTagValue: false,
  });

  const parsed = parser.parse(xml);
  const alignmentList: Alignment[] = [];

  const root = parsed.alignmentlist;
  if (!root || !root.alignment) {
    return alignmentList;
  }

  const alignments = root.alignment;
  for (const al of alignments) {
    // Java: a.getScore().floatValue() — truncate parsed score to 32-bit float
    const score = al['@_score'] !== undefined ? Math.fround(parseFloat(al['@_score'])) : Alignment.DEFAULT_SCORE;

    const sourceSegments: string[] = extractSegments(al.sourcelist);
    const targetSegments: string[] = extractSegments(al.targetlist);

    alignmentList.push(new Alignment(sourceSegments, targetSegments, score));
  }

  return alignmentList;
}

function extractSegments(segmentList: any): string[] {
  if (!segmentList || !segmentList.segment) {
    return [];
  }
  const segments = segmentList.segment;
  if (!Array.isArray(segments)) {
    return [String(segments)];
  }
  return segments.map((s: any) => String(s));
}

/**
 * Cached XMLBuilder for formatAl — stateless, can be reused.
 */
const alBuilderOptions: XmlBuilderOptions & { entities: any[] } = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '    ',
  suppressEmptyNode: false,
  processEntities: true,
  // Only encode the XML-required entities (&, <, >), not apostrophes/quotes,
  // to match Java JAXB behavior.
  entities: [
    { regex: /&/g, val: '&amp;' },
    { regex: />/g, val: '&gt;' },
    { regex: /</g, val: '&lt;' },
  ],
};
const alBuilder = new XMLBuilder(alBuilderOptions);

/**
 * Formats Alignment array into .al XML format.
 */
export function formatAl(alignments: Alignment[]): string {

  const alignmentElements = alignments.map((al) => {
    const obj: any = {
      sourcelist: {
        segment: al.sourceSegmentList.length > 0 ? al.sourceSegmentList : [],
      },
      targetlist: {
        segment: al.targetSegmentList.length > 0 ? al.targetSegmentList : [],
      },
    };
    obj['@_score'] = Number.isInteger(al.score) ? al.score.toFixed(1) : String(al.score);
    return obj;
  });

  const xmlObj = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8', '@_standalone': 'yes' },
    alignmentlist: {
      alignment: alignmentElements,
    },
  };

  return alBuilder.build(xmlObj);
}

import { XMLParser, XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';
import { Alignment } from '../../coretypes/Alignment';

/**
 * Exception thrown when TMX parsing encounters invalid structure,
 * such as duplicate language variants in a single TU.
 */
export class TmxParseException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TmxParseException';
  }
}

/**
 * Parses TMX XML format into Alignment array.
 *
 * Format:
 * <tmx version="1.1">
 *   <header ... srclang="en" />
 *   <body>
 *     <tu>
 *       <tuv xml:lang="en"><seg>source text</seg></tuv>
 *       <tuv xml:lang="pl"><seg>target text</seg></tuv>
 *     </tu>
 *   </body>
 * </tmx>
 */
export function parseTmx(
  xml: string,
  sourceLanguage: string,
  targetLanguage: string
): Alignment[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name: string) => {
      return name === 'tu' || name === 'tuv' || name === 'prop' || name === 'note';
    },
    trimValues: false,
  });

  const parsed = parser.parse(xml);
  const alignmentList: Alignment[] = [];

  const tmx = parsed.tmx;
  if (!tmx || !tmx.body || !tmx.body.tu) {
    return alignmentList;
  }

  const tus = tmx.body.tu;
  for (const tu of tus) {
    if (!tu.tuv) continue;

    const sourceSegments: string[] = [];
    const targetSegments: string[] = [];
    let score = Alignment.DEFAULT_SCORE;
    let sourceCount = 0;
    let targetCount = 0;

    for (const tuv of tu.tuv) {
      const lang = tuv['@_xml:lang'] || '';
      const segText = extractSegText(tuv.seg);

      // Check for score in prop
      if (tuv.prop) {
        const props = Array.isArray(tuv.prop) ? tuv.prop : [tuv.prop];
        for (const prop of props) {
          if (prop['@_type'] === 'score') {
            score = parseFloat(String(prop['#text'] || prop));
          }
        }
      }

      if (lang === sourceLanguage) {
        sourceCount++;
        if (sourceCount > 1) {
          throw new TmxParseException(
            `Multiple variants for source language '${sourceLanguage}' in a single TU.`
          );
        }
        sourceSegments.push(segText);
      } else if (lang === targetLanguage) {
        targetCount++;
        if (targetCount > 1) {
          throw new TmxParseException(
            `Multiple variants for target language '${targetLanguage}' in a single TU.`
          );
        }
        targetSegments.push(segText);
      }
    }

    // Also check tu-level props for score
    if (tu.prop) {
      const props = Array.isArray(tu.prop) ? tu.prop : [tu.prop];
      for (const prop of props) {
        if (prop['@_type'] === 'score') {
          score = parseFloat(String(prop['#text'] || prop));
        }
      }
    }

    if (sourceSegments.length > 0 || targetSegments.length > 0) {
      alignmentList.push(new Alignment(sourceSegments, targetSegments, score));
    }
  }

  return alignmentList;
}

function extractSegText(seg: any): string {
  if (seg === undefined || seg === null) return '';
  if (typeof seg === 'string') return seg;
  if (typeof seg === 'object') {
    // Handle mixed content — just get text
    if (seg['#text'] !== undefined) return String(seg['#text']);
    return '';
  }
  return String(seg);
}

/**
 * Formats Alignment array into TMX XML format.
 */
export function formatTmx(
  alignments: Alignment[],
  sourceLanguage: string,
  targetLanguage: string
): string {
  const builderOptions: XmlBuilderOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    suppressEmptyNode: false,
  };
  const builder = new XMLBuilder(builderOptions);

  const tus: any[] = [];
  for (const al of alignments) {
    const tuvs: any[] = [];

    // TMX spec: one <tuv> per language per TU.
    // Merge multiple segments into a single string (matching Java behavior).
    if (al.sourceSegmentList.length > 0) {
      tuvs.push({
        '@_xml:lang': sourceLanguage,
        seg: al.sourceSegmentList.join(''),
      });
    }

    if (al.targetSegmentList.length > 0) {
      tuvs.push({
        '@_xml:lang': targetLanguage,
        seg: al.targetSegmentList.join(''),
      });
    }

    const tu: any = {
      tuv: tuvs,
    };

    tus.push(tu);
  }

  const xmlObj = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    tmx: {
      '@_version': '1.1',
      header: {
        '@_creationtool': 'maligna',
        '@_creationtoolversion': '3.0',
        '@_segtype': 'sentence',
        '@_o-tmf': 'plaintext',
        '@_adminlang': 'en',
        '@_srclang': sourceLanguage,
        '@_datatype': 'plaintext',
      },
      body: {
        tu: tus,
      },
    },
  };

  return builder.build(xmlObj);
}

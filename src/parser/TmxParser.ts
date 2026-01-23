import { Alignment } from '../core/Alignment.js';
import { Parser } from './Parser.js';
import { XMLParser } from 'fast-xml-parser';

interface TmxTuv {
  seg: string;
  '@_xml:lang'?: string;
}

interface TmxTu {
  tuv: TmxTuv[];
}

interface TmxBody {
  tu: TmxTu | TmxTu[];
}

interface TmxRoot {
  tmx: {
    body: TmxBody;
  };
}

/**
 * Parser for TMX (Translation Memory eXchange) format.
 */
export class TmxParser implements Parser {
  private readonly content: string;
  private readonly sourceLang?: string;
  private readonly targetLang?: string;

  constructor(content: string, sourceLang?: string, targetLang?: string) {
    this.content = content;
    this.sourceLang = sourceLang;
    this.targetLang = targetLang;
  }

  parse(): Alignment[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const result: TmxRoot = parser.parse(this.content);
    const alignments: Alignment[] = [];

    const body = result.tmx?.body;
    if (!body?.tu) {
      return alignments;
    }

    const tus = Array.isArray(body.tu) ? body.tu : [body.tu];

    for (const tu of tus) {
      if (!tu.tuv || !Array.isArray(tu.tuv) || tu.tuv.length < 2) {
        continue;
      }

      let sourceSegment: string | undefined;
      let targetSegment: string | undefined;

      if (this.sourceLang && this.targetLang) {
        // Find by language
        for (const tuv of tu.tuv) {
          const lang = tuv['@_xml:lang']?.toLowerCase();
          if (lang === this.sourceLang.toLowerCase()) {
            sourceSegment = String(tuv.seg || '');
          } else if (lang === this.targetLang.toLowerCase()) {
            targetSegment = String(tuv.seg || '');
          }
        }
      } else {
        // Use first two tuv elements
        sourceSegment = String(tu.tuv[0]?.seg || '');
        targetSegment = String(tu.tuv[1]?.seg || '');
      }

      if (sourceSegment !== undefined && targetSegment !== undefined) {
        alignments.push(new Alignment([sourceSegment], [targetSegment]));
      }
    }

    return alignments;
  }
}

import { XMLParser } from 'fast-xml-parser';
import { Alignment } from '../coretypes/index.js';
import { Parser } from './Parser.js';
import { TmxParseException } from './TmxParseException.js';

/**
 * Interface representing the parsed TMX XML structure.
 */
interface TmxSeg {
  _text?: string;
  [key: string]: unknown;
}

interface TmxTuv {
  lang?: string;
  'xml:lang'?: string;
  seg: TmxSeg | string;
}

interface TmxTu {
  tuv?: TmxTuv | TmxTuv[];
}

interface TmxBody {
  tu?: TmxTu | TmxTu[];
}

interface TmxDocument {
  tmx: {
    body: TmxBody;
  };
}

/**
 * Represents TMX document parser.
 * 
 * Each translation unit in TMX is treated as a separate alignment.
 * From each translation unit only variants in two configured languages are
 * retrieved. If there are no variants in given language the alignment is
 * treated as n to zero, if there is one variant in given language it is
 * treated as n to one, if there are more than one variant in a given
 * language an exception is thrown. Ignores translation units that do not
 * contain variants in any of given languages (it would create zero to zero
 * alignment).
 */
export class TmxParser implements Parser {
  private content: string;
  private sourceLanguageCode: string | null;
  private targetLanguageCode: string | null;

  /**
   * Creates TMX document parser.
   * @param content TMX document content
   * @param sourceLanguageCode source language code (en, de, pl, etc.)
   * @param targetLanguageCode target language code
   */
  constructor(content: string, sourceLanguageCode?: string, targetLanguageCode?: string) {
    this.content = content;
    this.sourceLanguageCode = sourceLanguageCode ?? null;
    this.targetLanguageCode = targetLanguageCode ?? null;
  }

  /**
   * Parses TMX document into alignment list.
   * @returns alignment list
   */
  parse(): Alignment[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '_text',
      isArray: (name) => name === 'tu' || name === 'tuv',
    });

    const doc: TmxDocument = parser.parse(this.content);
    const alignmentList: Alignment[] = [];

    const body = doc.tmx?.body;
    if (!body) {
      return alignmentList;
    }

    const tuList = this.ensureArray(body.tu);

    if (this.sourceLanguageCode === null || this.targetLanguageCode === null) {
      this.initLanguageCodes(tuList);
    }

    for (const tu of tuList) {
      const sourceSegmentList = this.createSegmentList(tu, this.sourceLanguageCode!);
      const targetSegmentList = this.createSegmentList(tu, this.targetLanguageCode!);
      
      // Ignore empty alignments
      if (sourceSegmentList.length > 0 || targetSegmentList.length > 0) {
        const alignment = new Alignment(sourceSegmentList, targetSegmentList);
        alignmentList.push(alignment);
      }
    }

    return alignmentList;
  }

  private createSegmentList(tu: TmxTu, languageCode: string): string[] {
    const segmentList: string[] = [];
    const tuvList = this.ensureArray(tu.tuv);

    for (const tuv of tuvList) {
      const lang = tuv.lang || tuv['xml:lang'];
      if (languageCode === lang) {
        const segment = this.getSegment(tuv.seg);
        segmentList.push(segment);
      }
    }

    if (segmentList.length > 1) {
      throw new TmxParseException(`${languageCode} variant count greater than 1`);
    }

    return segmentList;
  }

  private getSegment(seg: TmxSeg | string): string {
    if (typeof seg === 'string') {
      return seg;
    }
    if (seg._text !== undefined) {
      return String(seg._text);
    }
    // Handle mixed content - concatenate all text content
    let result = '';
    for (const [key, value] of Object.entries(seg)) {
      if (key === '_text' || typeof value === 'string') {
        result += value;
      }
    }
    return result;
  }

  private initLanguageCodes(tuList: TmxTu[]): void {
    const languageCodeSet = this.getLanguageCodeSet(tuList);
    if (languageCodeSet.size !== 2) {
      throw new TmxParseException('Document does not contain units exactly in 2 languages');
    }
    const languageCodeArray = Array.from(languageCodeSet).sort();
    this.sourceLanguageCode = languageCodeArray[0] ?? null;
    this.targetLanguageCode = languageCodeArray[1] ?? null;
  }

  private getLanguageCodeSet(tuList: TmxTu[]): Set<string> {
    const languageCodeSet = new Set<string>();
    for (const tu of tuList) {
      const tuvList = this.ensureArray(tu.tuv);
      for (const tuv of tuvList) {
        const lang = tuv.lang || tuv['xml:lang'];
        if (lang) {
          languageCodeSet.add(lang);
        }
      }
    }
    return languageCodeSet;
  }

  private ensureArray<T>(value: T | T[] | undefined): T[] {
    if (!value) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }
}

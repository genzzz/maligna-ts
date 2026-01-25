import { XMLBuilder } from 'fast-xml-parser';
import { Alignment } from '../coretypes/index.js';
import { Formatter } from './Formatter.js';
import { merge } from '../util/index.js';

/**
 * Represents a formatter that produces TMX file output.
 * 
 * The output will be stored in TMX 1.4b format.
 * Each alignment is represented by translation unit with properly set
 * source and target languages. All source / target segments inside alignments
 * are merged and space is inserted between them.
 */
export class TmxFormatter implements Formatter {
  static readonly TMX_VERSION = '1.4b';
  static readonly TMX_ADMINLANG = 'en';
  static readonly TMX_CREATIONTOOL = 'mALIGNa';
  static readonly TMX_CREATIONTOOLVERSION = '2';
  static readonly TMX_SEGTYPE = 'block';
  static readonly TMX_DATATYPE = 'plaintext';
  static readonly TMX_OTMF = 'al';

  private sourceLanguageCode: string;
  private targetLanguageCode: string;

  constructor(sourceLanguageCode: string, targetLanguageCode: string) {
    this.sourceLanguageCode = sourceLanguageCode;
    this.targetLanguageCode = targetLanguageCode;
  }

  format(alignmentList: Alignment[]): string {
    const tus = alignmentList
      .map(alignment => this.createTu(alignment))
      .filter(tu => tu !== null);

    const doc = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      tmx: {
        '@_version': TmxFormatter.TMX_VERSION,
        header: {
          '@_adminlang': TmxFormatter.TMX_ADMINLANG,
          '@_srclang': this.sourceLanguageCode,
          '@_creationtool': TmxFormatter.TMX_CREATIONTOOL,
          '@_creationtoolversion': TmxFormatter.TMX_CREATIONTOOLVERSION,
          '@_segtype': TmxFormatter.TMX_SEGTYPE,
          '@_datatype': TmxFormatter.TMX_DATATYPE,
          '@_o-tmf': TmxFormatter.TMX_OTMF,
          '@_creationdate': this.getIsoDateNoMillis(new Date()),
        },
        body: {
          tu: tus,
        },
      },
    };

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      indentBy: '  ',
      suppressEmptyNode: false,
    });

    return builder.build(doc);
  }

  private createTu(alignment: Alignment): object | null {
    const tuvs: object[] = [];

    if (alignment.sourceSegmentList.length > 0) {
      tuvs.push(this.createTuv(this.sourceLanguageCode, alignment.sourceSegmentList));
    }

    if (alignment.targetSegmentList.length > 0) {
      tuvs.push(this.createTuv(this.targetLanguageCode, alignment.targetSegmentList));
    }

    if (tuvs.length === 0) {
      return null;
    }

    return { tuv: tuvs };
  }

  private createTuv(languageCode: string, segmentList: readonly string[]): object {
    const segment = merge([...segmentList]);
    return {
      '@_xml:lang': languageCode,
      seg: segment,
    };
  }

  private getIsoDateNoMillis(date: Date): string {
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
}

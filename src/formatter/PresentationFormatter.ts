import { Formatter } from './Formatter';
import { Alignment } from '../coretypes/Alignment';

/**
 * Presentation formatter — two-column human-readable format.
 * Matches the Java PresentationFormatter output exactly.
 */
export class PresentationFormatter implements Formatter {
  static readonly DEFAULT_WIDTH = 79;
  static readonly MIN_WIDTH = 5;

  private width: number;
  private maxLength: number;
  private emptyString: string;

  constructor(width: number = PresentationFormatter.DEFAULT_WIDTH) {
    if (width < PresentationFormatter.MIN_WIDTH) {
      throw new Error(
        `Width is: ${width} and must be at least: ${PresentationFormatter.MIN_WIDTH}`
      );
    }
    this.width = width;
    this.maxLength = Math.floor((this.width - 3) / 2);
    this.emptyString = ' '.repeat(this.maxLength);
  }

  format(alignmentList: Alignment[]): string {
    const lines: string[] = [];

    for (let index = 0; index < alignmentList.length; index++) {
      const alignment = alignmentList[index];

      const sourceList = this.splitStringList(
        alignment.sourceSegmentList,
        this.maxLength
      );
      const targetList = this.splitStringList(
        alignment.targetSegmentList,
        this.maxLength
      );

      let si = 0;
      let ti = 0;

      // Both have lines
      while (si < sourceList.length && ti < targetList.length) {
        lines.push(this.formatString(sourceList[si], targetList[ti]));
        si++;
        ti++;
      }
      // Remaining source lines
      while (si < sourceList.length) {
        lines.push(this.formatString(sourceList[si], this.emptyString));
        si++;
      }
      // Remaining target lines
      while (ti < targetList.length) {
        lines.push(this.formatString(this.emptyString, targetList[ti]));
        ti++;
      }

      // Separator between alignments (not after last)
      if (index < alignmentList.length - 1) {
        const sep =
          '_'.repeat(this.maxLength + 1) +
          '|' +
          '_'.repeat(this.maxLength + 1);
        lines.push(sep);
      }
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Splits a list of segments into display lines.
   * Each segment is split individually; segments are separated by an empty line.
   */
  private splitStringList(
    stringList: string[],
    maxLength: number
  ): string[] {
    const result: string[] = [];
    for (let i = 0; i < stringList.length; i++) {
      const splitLines = this.splitString(stringList[i], maxLength);
      result.push(...splitLines);
      // Add empty line between segments (not after last)
      if (i < stringList.length - 1) {
        result.push(this.emptyString);
      }
    }
    return result;
  }

  /**
   * Character-level splitting of a single string into fixed-width lines.
   * Handles \n as pad-to-end-of-line and \t as 4-space tab.
   */
  private splitString(str: string, maxLength: number): string[] {
    const stringList: string[] = [];
    let builder = '';

    for (let pos = 0; pos < str.length; pos++) {
      const ch = str[pos];
      if (ch === '\n') {
        const eolWidth = maxLength - builder.length;
        builder += ' '.repeat(eolWidth);
      } else if (ch === '\t') {
        const tabWidth = Math.min(4, maxLength - builder.length);
        builder += ' '.repeat(tabWidth);
      } else {
        builder += ch;
      }
      if (builder.length >= maxLength) {
        stringList.push(builder.substring(0, maxLength));
        builder = builder.substring(maxLength);
      }
    }

    if (builder.length > 0) {
      builder += ' '.repeat(maxLength - builder.length);
      stringList.push(builder);
    }

    return stringList;
  }

  private formatString(sourceString: string, targetString: string): string {
    return sourceString + ' | ' + targetString;
  }
}

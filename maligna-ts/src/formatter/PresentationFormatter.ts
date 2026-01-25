import { Alignment } from '../coretypes/index.js';
import { Formatter } from './Formatter.js';

/**
 * Represents a plaintext formatter that produces human-readable output.
 * 
 * The output is stored in two columns representing source and target texts.
 */
export class PresentationFormatter implements Formatter {
  static readonly DEFAULT_WIDTH = 79;
  static readonly MIN_WIDTH = 5;

  private width: number;
  private maxLength: number;
  private emptyString: string;

  /**
   * Constructs the formatter.
   * @param width output text width (usually console width)
   */
  constructor(width: number = PresentationFormatter.DEFAULT_WIDTH) {
    if (width < PresentationFormatter.MIN_WIDTH) {
      throw new Error(
        `Width is: ${width} and must be at least: ${PresentationFormatter.MIN_WIDTH}`
      );
    }
    this.width = width;
    this.maxLength = Math.floor((this.width - 3) / 2);
    this.emptyString = this.buildString(' ', this.maxLength);
  }

  /**
   * Formats the alignment list. The output is stored in two columns.
   * Total width of both columns including frames is defined in constructor.
   * 
   * @param alignmentList input alignment list
   * @returns formatted string
   */
  format(alignmentList: Alignment[]): string {
    const lines: string[] = [];

    for (let index = 0; index < alignmentList.length; index++) {
      const alignment = alignmentList[index]!;
      const sourceList = this.splitStringList(
        [...alignment.sourceSegmentList],
        this.maxLength
      );
      const targetList = this.splitStringList(
        [...alignment.targetSegmentList],
        this.maxLength
      );

      let sourceIdx = 0;
      let targetIdx = 0;

      while (sourceIdx < sourceList.length && targetIdx < targetList.length) {
        lines.push(
          this.formatString(sourceList[sourceIdx]!, targetList[targetIdx]!, this.maxLength)
        );
        sourceIdx++;
        targetIdx++;
      }

      while (sourceIdx < sourceList.length) {
        lines.push(
          this.formatString(sourceList[sourceIdx]!, this.emptyString, this.maxLength)
        );
        sourceIdx++;
      }

      while (targetIdx < targetList.length) {
        lines.push(
          this.formatString(this.emptyString, targetList[targetIdx]!, this.maxLength)
        );
        targetIdx++;
      }

      if (index < alignmentList.length - 1) {
        lines.push(
          this.buildString('_', this.maxLength + 1) +
            '|' +
            this.buildString('_', this.maxLength + 1)
        );
      }
    }

    return lines.join('\n');
  }

  private splitStringList(stringList: string[], maxLength: number): string[] {
    const splitStringList: string[] = [];

    for (let index = 0; index < stringList.length; index++) {
      const str = stringList[index]!;
      splitStringList.push(...this.splitString(str, maxLength));
      if (index < stringList.length - 1) {
        splitStringList.push(this.emptyString);
      }
    }

    return splitStringList;
  }

  private splitString(str: string, maxLength: number): string[] {
    const stringList: string[] = [];
    let builder = '';

    for (let position = 0; position < str.length; position++) {
      const ch = str.charAt(position);

      if (ch === '\n') {
        const eolWidth = maxLength - builder.length;
        builder += this.buildString(' ', eolWidth);
      } else if (ch === '\t') {
        const tabWidth = Math.min(4, maxLength - builder.length);
        builder += this.buildString(' ', tabWidth);
      } else {
        builder += ch;
      }

      if (builder.length >= maxLength) {
        const line = builder.substring(0, maxLength);
        stringList.push(line);
        builder = builder.substring(maxLength);
      }
    }

    if (builder.length > 0) {
      builder += this.buildString(' ', maxLength - builder.length);
      stringList.push(builder);
    }

    return stringList;
  }

  private formatString(
    sourceString: string,
    targetString: string,
    _maxLength: number
  ): string {
    return sourceString + ' | ' + targetString;
  }

  private buildString(character: string, length: number): string {
    if (length <= 0) {
      return '';
    }
    return character.repeat(length);
  }
}

import { Alignment } from '../coretypes/index.js';
import { Parser } from './Parser.js';

/**
 * Represents plaintext document parser into an alignment.
 * 
 * Can be constructed from strings as well as files.
 * The whole content of each input file (STRING) is treated as a single segment.
 * Always returns alignment list containing just one alignment.
 */
export class PlaintextParser implements Parser {
  private sourceString: string;
  private targetString: string;

  /**
   * Constructs a parser from source and target string.
   * @param sourceString source segment
   * @param targetString target segment
   */
  constructor(sourceString: string, targetString: string) {
    this.sourceString = sourceString;
    this.targetString = targetString;
  }

  /**
   * Creates a PlaintextParser from file contents.
   * @param sourceContent source file content
   * @param targetContent target file content
   * @returns PlaintextParser instance
   */
  static fromContent(sourceContent: string, targetContent: string): PlaintextParser {
    return new PlaintextParser(sourceContent, targetContent);
  }

  /**
   * Parses input documents into an alignment list
   * @returns alignment list containing just one alignment with one source 
   *      and one target segment
   */
  parse(): Alignment[] {
    const sourceSegmentList = [this.sourceString];
    const targetSegmentList = [this.targetString];
    const alignment = new Alignment(sourceSegmentList, targetSegmentList);
    return [alignment];
  }
}

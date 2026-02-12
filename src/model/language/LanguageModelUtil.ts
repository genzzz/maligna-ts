import { LanguageModel, MutableLanguageModel } from './LanguageModel';

/**
 * Trains a language model from a list of word ID segments.
 */
export function trainLanguageModel(segmentWidList: number[][]): LanguageModel {
  const model = new MutableLanguageModel();
  for (const segment of segmentWidList) {
    for (const wid of segment) {
      model.addWord(wid);
    }
  }
  model.normalize();
  return model;
}

/**
 * Parses a language model from a text format.
 * Each line contains: wid\tcount
 * Matches Java's LanguageModelUtil.parse() which reads wid and count,
 * then calls addWordOccurrence(wid, count).
 */
export function parseLanguageModel(text: string): LanguageModel {
  const model = new MutableLanguageModel();
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length === 2) {
      const wid = parseInt(parts[0], 10);
      const count = parseInt(parts[1], 10);
      if (isNaN(wid) || isNaN(count)) {
        throw new Error('Part format error');
      }
      model.addWordOccurrence(wid, count);
    } else if (parts.length !== 0) {
      throw new Error('Bad number of line parts.');
    }
  }
  model.normalize();
  return model;
}

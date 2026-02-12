import { describe, test, expect } from 'vitest';
import { CharCounter, SplitCounter } from '../../../src/calculator/length/Counter';

describe('CharCounterTest', () => {
  const counter = new CharCounter();

  test('countSingleEmpty', () => {
    expect(counter.countSingle('')).toBe(0);
  });

  test('countSingleWord', () => {
    expect(counter.countSingle('hello')).toBe(5);
  });

  test('countSingleWithSpaces', () => {
    expect(counter.countSingle('hello world')).toBe(11);
  });

  test('countSingleUnicode', () => {
    // Polish characters
    expect(counter.countSingle('niżej')).toBe(5);
  });

  test('countMultipleSegments', () => {
    expect(counter.count(['ab', 'cde'])).toBe(5);
  });

  test('countEmptyList', () => {
    expect(counter.count([])).toBe(0);
  });

  test('countRange', () => {
    expect(counter.countRange(['ab', 'cde', 'f'], 0, 2)).toBe(5);
    expect(counter.countRange(['ab', 'cde', 'f'], 1, 3)).toBe(4);
    expect(counter.countRange(['ab', 'cde', 'f'], 0, 3)).toBe(6);
  });

  test('countRangeEmpty', () => {
    expect(counter.countRange(['ab', 'cde'], 0, 0)).toBe(0);
  });
});

describe('SplitCounterTest', () => {
  const counter = new SplitCounter();

  test('countSingleEmpty', () => {
    expect(counter.countSingle('')).toBe(0);
  });

  test('countSingleOneWord', () => {
    expect(counter.countSingle('hello')).toBe(1);
  });

  test('countSingleTwoWords', () => {
    expect(counter.countSingle('hello world')).toBe(2);
  });

  test('countSingleMultipleSpaces', () => {
    // Multiple whitespace between words should still count 2 words
    expect(counter.countSingle('hello   world')).toBe(2);
  });

  test('countSingleWithPunctuation', () => {
    // Punctuation is not a letter/digit, so it acts as separator
    // "hello,world" → 2 words: "hello", "world"
    expect(counter.countSingle('hello,world')).toBe(2);
  });

  test('countSingleWhitespaceOnly', () => {
    expect(counter.countSingle('   ')).toBe(0);
  });

  test('countSingleWithTabsAndNewlines', () => {
    expect(counter.countSingle("ab\t9\net")).toBe(3);
  });

  test('countMultipleSegments', () => {
    expect(counter.count(['hello world', 'foo'])).toBe(3);
  });

  test('countEmptyList', () => {
    expect(counter.count([])).toBe(0);
  });

  test('countRange', () => {
    expect(counter.countRange(['hello world', 'foo bar', 'baz'], 0, 2)).toBe(4);
  });
});

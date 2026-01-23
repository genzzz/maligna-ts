import {
  Vocabulary,
  defaultTokenize,
} from '../../../src/model/vocabulary/Vocabulary';

describe('Vocabulary', () => {
  describe('constructor', () => {
    it('should create vocabulary with special words', () => {
      const vocab = new Vocabulary();
      expect(vocab.containsWord(Vocabulary.NULL_WORD)).toBe(true);
      expect(vocab.containsWord(Vocabulary.UNKNOWN_WORD)).toBe(true);
    });

    it('should create vocabulary from word collection', () => {
      const vocab = new Vocabulary(['hello', 'world']);
      expect(vocab.containsWord('hello')).toBe(true);
      expect(vocab.containsWord('world')).toBe(true);
    });

    it('should have NULL_WID as 0', () => {
      expect(Vocabulary.NULL_WID).toBe(0);
    });

    it('should have UNKNOWN_WID as 1', () => {
      expect(Vocabulary.UNKNOWN_WID).toBe(1);
    });
  });

  describe('getWid', () => {
    it('should return wid for existing word', () => {
      const vocab = new Vocabulary(['hello', 'world']);
      const wid = vocab.getWid('hello');
      expect(wid).toBeDefined();
      expect(typeof wid).toBe('number');
    });

    it('should return undefined for non-existing word', () => {
      const vocab = new Vocabulary(['hello']);
      expect(vocab.getWid('notexist')).toBeUndefined();
    });

    it('should return 0 for NULL_WORD', () => {
      const vocab = new Vocabulary();
      expect(vocab.getWid(Vocabulary.NULL_WORD)).toBe(0);
    });

    it('should return 1 for UNKNOWN_WORD', () => {
      const vocab = new Vocabulary();
      expect(vocab.getWid(Vocabulary.UNKNOWN_WORD)).toBe(1);
    });
  });

  describe('getWidOrUnknown', () => {
    it('should return wid for existing word', () => {
      const vocab = new Vocabulary(['hello']);
      const wid = vocab.getWidOrUnknown('hello');
      expect(wid).toBeGreaterThan(1);
    });

    it('should return UNKNOWN_WID for non-existing word', () => {
      const vocab = new Vocabulary(['hello']);
      expect(vocab.getWidOrUnknown('notexist')).toBe(Vocabulary.UNKNOWN_WID);
    });
  });

  describe('getWidList', () => {
    it('should return wids for word list', () => {
      const vocab = new Vocabulary(['hello', 'world']);
      const wids = vocab.getWidList(['hello', 'world', 'unknown']);
      expect(wids.length).toBe(3);
      expect(wids[0]).toBeDefined();
      expect(wids[1]).toBeDefined();
      expect(wids[2]).toBeUndefined();
    });
  });

  describe('containsWid', () => {
    it('should return true for valid wid', () => {
      const vocab = new Vocabulary(['hello']);
      expect(vocab.containsWid(0)).toBe(true);
      expect(vocab.containsWid(1)).toBe(true);
      expect(vocab.containsWid(2)).toBe(true);
    });

    it('should return false for invalid wid', () => {
      const vocab = new Vocabulary(['hello']);
      expect(vocab.containsWid(-1)).toBe(false);
      expect(vocab.containsWid(100)).toBe(false);
    });
  });

  describe('getWord', () => {
    it('should return word for valid wid', () => {
      const vocab = new Vocabulary(['hello']);
      const helloWid = vocab.getWid('hello')!;
      expect(vocab.getWord(helloWid)).toBe('hello');
    });

    it('should return undefined for invalid wid', () => {
      const vocab = new Vocabulary(['hello']);
      expect(vocab.getWord(100)).toBeUndefined();
    });

    it('should return NULL_WORD for wid 0', () => {
      const vocab = new Vocabulary();
      expect(vocab.getWord(0)).toBe(Vocabulary.NULL_WORD);
    });

    it('should return UNKNOWN_WORD for wid 1', () => {
      const vocab = new Vocabulary();
      expect(vocab.getWord(1)).toBe(Vocabulary.UNKNOWN_WORD);
    });
  });

  describe('containsWord', () => {
    it('should return true for existing word', () => {
      const vocab = new Vocabulary(['hello']);
      expect(vocab.containsWord('hello')).toBe(true);
    });

    it('should return false for non-existing word', () => {
      const vocab = new Vocabulary(['hello']);
      expect(vocab.containsWord('world')).toBe(false);
    });
  });

  describe('putWord', () => {
    it('should add new word and return wid', () => {
      const vocab = new Vocabulary();
      const wid = vocab.putWord('newword');
      expect(wid).toBeGreaterThan(1);
      expect(vocab.containsWord('newword')).toBe(true);
    });

    it('should return existing wid for duplicate word', () => {
      const vocab = new Vocabulary();
      const wid1 = vocab.putWord('word');
      const wid2 = vocab.putWord('word');
      expect(wid1).toBe(wid2);
    });

    it('should assign sequential wids', () => {
      const vocab = new Vocabulary();
      const wid1 = vocab.putWord('first');
      const wid2 = vocab.putWord('second');
      expect(wid2).toBe(wid1 + 1);
    });
  });

  describe('putWordList', () => {
    it('should add all words', () => {
      const vocab = new Vocabulary();
      vocab.putWordList(['one', 'two', 'three']);
      expect(vocab.containsWord('one')).toBe(true);
      expect(vocab.containsWord('two')).toBe(true);
      expect(vocab.containsWord('three')).toBe(true);
    });

    it('should handle empty list', () => {
      const vocab = new Vocabulary();
      vocab.putWordList([]);
      expect(vocab.wordCount).toBe(0);
    });
  });

  describe('wordCount', () => {
    it('should return count excluding special words', () => {
      const vocab = new Vocabulary(['a', 'b', 'c']);
      expect(vocab.wordCount).toBe(3);
    });

    it('should return 0 for empty vocabulary', () => {
      const vocab = new Vocabulary();
      expect(vocab.wordCount).toBe(0);
    });
  });

  describe('size', () => {
    it('should return total size including special words', () => {
      const vocab = new Vocabulary(['a', 'b', 'c']);
      expect(vocab.size).toBe(5); // NULL + UNKNOWN + 3 words
    });

    it('should return 2 for empty vocabulary (special words only)', () => {
      const vocab = new Vocabulary();
      expect(vocab.size).toBe(2);
    });
  });
});

describe('defaultTokenize', () => {
  it('should split on whitespace', () => {
    const result = defaultTokenize('hello world');
    expect(result).toEqual(['hello', 'world']);
  });

  it('should handle multiple spaces', () => {
    const result = defaultTokenize('hello    world');
    expect(result).toEqual(['hello', 'world']);
  });

  it('should handle tabs and newlines', () => {
    const result = defaultTokenize('hello\tworld\nnew');
    expect(result).toEqual(['hello', 'world', 'new']);
  });

  it('should trim leading and trailing whitespace', () => {
    const result = defaultTokenize('  hello world  ');
    expect(result).toEqual(['hello', 'world']);
  });

  it('should return empty array for empty string', () => {
    expect(defaultTokenize('')).toEqual([]);
  });

  it('should return empty array for whitespace-only string', () => {
    expect(defaultTokenize('   ')).toEqual([]);
  });

  it('should handle single word', () => {
    expect(defaultTokenize('hello')).toEqual(['hello']);
  });
});

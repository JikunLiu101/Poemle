import { describe, expect, it } from 'vitest';
import {
  CJK_RE,
  INTRA_PUNCT_RE,
  cjkCount,
  filterInput,
  isCJK,
  onlyCJK,
} from './cjk';

describe('CJK_RE / isCJK', () => {
  it('matches CJK Unified Ideographs', () => {
    for (const ch of '床前明月光诗乐') {
      expect(isCJK(ch)).toBe(true);
      expect(CJK_RE.test(ch)).toBe(true);
    }
  });

  it('does NOT match Latin, digits, or punctuation', () => {
    for (const ch of 'aZ5 !.,，；。') {
      expect(isCJK(ch)).toBe(false);
    }
  });
});

describe('INTRA_PUNCT_RE', () => {
  it('matches ，；：、 but not sentence-final punctuation', () => {
    for (const ch of '，；：、') {
      expect(INTRA_PUNCT_RE.test(ch)).toBe(true);
    }
    for (const ch of '。！？') {
      expect(INTRA_PUNCT_RE.test(ch)).toBe(false);
    }
  });
});

describe('onlyCJK', () => {
  it('returns the CJK-only substring in order', () => {
    expect(onlyCJK('床前明月光')).toBe('床前明月光');
    expect(onlyCJK('床前明月光，疑是地上霜')).toBe('床前明月光疑是地上霜');
    expect(onlyCJK('abc床def前gh光')).toBe('床前光');
  });

  it('returns an empty string for empty/Latin-only input', () => {
    expect(onlyCJK('')).toBe('');
    expect(onlyCJK('abc 123')).toBe('');
  });
});

describe('cjkCount', () => {
  it('counts only CJK characters', () => {
    expect(cjkCount('床前明月光')).toBe(5);
    expect(cjkCount('床前明月光，疑是地上霜')).toBe(10);
    expect(cjkCount('chuangqian床前')).toBe(2);
    expect(cjkCount('')).toBe(0);
  });
});

describe('filterInput', () => {
  it('keeps CJK and intra-sentence punctuation as-is', () => {
    expect(filterInput('床前明月光，疑是地上霜', 10)).toBe(
      '床前明月光，疑是地上霜',
    );
  });

  it('strips Latin, digits, and other noise', () => {
    expect(filterInput('chuang床前123qian', 10)).toBe('床前');
  });

  it('caps the CJK count at maxCJK but allows trailing punctuation', () => {
    // 11 CJK chars; only the first 5 should survive.
    expect(filterInput('床前明月光疑是地上霜白', 5)).toBe('床前明月光');
    // The trailing comma comes after 5 CJK already in the budget — punctuation
    // does not consume the CJK quota, so it is kept.
    expect(filterInput('床前明月光，', 5)).toBe('床前明月光，');
  });

  it('strips sentence-final punctuation', () => {
    // 。 ！ ？ are not in INTRA_PUNCT_RE, so they're dropped.
    expect(filterInput('床前明月光。', 10)).toBe('床前明月光');
    expect(filterInput('床前明月光！', 10)).toBe('床前明月光');
  });

  it('returns "" for empty or all-noise input', () => {
    expect(filterInput('', 10)).toBe('');
    expect(filterInput('abc def 123', 10)).toBe('');
  });

  it('handles maxCJK = 0 (no CJK allowed; punctuation still passes through)', () => {
    expect(filterInput('床前明月光，', 0)).toBe('，');
  });
});

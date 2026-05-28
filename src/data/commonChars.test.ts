import { describe, expect, it } from 'vitest';
import { COMMON_CHARS } from './commonChars';
import { PUNCTUATION_SET } from '../engine/constants';

describe('COMMON_CHARS', () => {
  it('has length exactly 40 (the dataset has well over 40 unique characters)', () => {
    expect(COMMON_CHARS.length).toBe(40);
  });

  it('contains no punctuation', () => {
    for (const ch of COMMON_CHARS) {
      expect(PUNCTUATION_SET.has(ch)).toBe(false);
    }
  });

  it('is frozen', () => {
    expect(Object.isFrozen(COMMON_CHARS)).toBe(true);
  });

  it('has no duplicates', () => {
    expect(new Set(COMMON_CHARS).size).toBe(COMMON_CHARS.length);
  });
});

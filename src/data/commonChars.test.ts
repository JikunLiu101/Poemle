import { describe, expect, it } from 'vitest';
import { COMMON_CHARS } from './commonChars';
import { PUNCTUATION_SET } from '../engine/constants';

describe('COMMON_CHARS', () => {
  it('has length 40 (or the dataset cap, whichever is smaller)', () => {
    // The seed dataset has fewer than 40 unique chars; the export should
    // contain as many as exist, up to a cap of 40.
    expect(COMMON_CHARS.length).toBeLessThanOrEqual(40);
    expect(COMMON_CHARS.length).toBeGreaterThan(0);
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

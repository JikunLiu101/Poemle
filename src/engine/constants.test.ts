import { describe, expect, it } from 'vitest';
import { MAX_ATTEMPTS, PUNCTUATION_SET, STORAGE_KEY } from './constants';

describe('engine constants', () => {
  it('exposes max attempts of 8', () => {
    expect(MAX_ATTEMPTS).toBe(8);
  });
  it('recognises common Chinese punctuation', () => {
    expect(PUNCTUATION_SET.size).toBe(14);
    expect(PUNCTUATION_SET.has('，')).toBe(true);
    expect(PUNCTUATION_SET.has('。')).toBe(true);
    expect(PUNCTUATION_SET.has('「')).toBe(true);
    expect(PUNCTUATION_SET.has('》')).toBe(true);
    expect(PUNCTUATION_SET.has('—')).toBe(true);
    expect(PUNCTUATION_SET.has('A')).toBe(false);
  });
  it('uses a single storage key', () => {
    expect(STORAGE_KEY).toBe('poemle_active_puzzle');
  });
});

import { describe, expect, it } from 'vitest';
import { stripPunctuation } from './punctuation';

describe('stripPunctuation', () => {
  it('returns the input unchanged when no punctuation is present', () => {
    const { clean, punctuationSlots } = stripPunctuation('床前明月光');
    expect(clean).toBe('床前明月光');
    expect(punctuationSlots.size).toBe(0);
  });

  it('removes a trailing 。 and records its slot', () => {
    const { clean, punctuationSlots } = stripPunctuation('床前明月光。');
    expect(clean).toBe('床前明月光');
    expect(punctuationSlots.size).toBe(1);
    expect(punctuationSlots.get(5)).toBe('。');
  });

  it('removes interior 、 and ， and records each slot at its ORIGINAL index', () => {
    const { clean, punctuationSlots } = stripPunctuation('天，地、人。');
    expect(clean).toBe('天地人');
    expect(punctuationSlots.get(1)).toBe('，');
    expect(punctuationSlots.get(3)).toBe('、');
    expect(punctuationSlots.get(5)).toBe('。');
  });

  it('handles strings made up only of punctuation', () => {
    const { clean, punctuationSlots } = stripPunctuation('。，！');
    expect(clean).toBe('');
    expect(punctuationSlots.size).toBe(3);
  });
});

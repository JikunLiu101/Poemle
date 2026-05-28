import { describe, expect, it } from 'vitest';
import type { SentenceRecord } from '../types';
import { formatYYYYMMDD, getDailyPuzzle, getRandomPuzzle } from './puzzle';

const fixtureIndex: SentenceRecord[] = [
  { poemId: 1, lineId: 11, text: 'A' },
  { poemId: 1, lineId: 12, text: 'B' },
  { poemId: 2, lineId: 21, text: 'C' },
  { poemId: 2, lineId: 22, text: 'D' },
];

describe('formatYYYYMMDD', () => {
  it('zero-pads month and day', () => {
    expect(formatYYYYMMDD(new Date(2026, 0, 3))).toBe('20260103'); // month is 0-indexed
  });
});

describe('getDailyPuzzle', () => {
  it('returns the same record for the same date', () => {
    const date = new Date(2026, 4, 28); // 2026-05-28
    const a = getDailyPuzzle(fixtureIndex, date);
    const b = getDailyPuzzle(fixtureIndex, date);
    expect(a).toEqual(b);
  });

  it('returns a record whose lineId is in the index', () => {
    const r = getDailyPuzzle(fixtureIndex, new Date(2026, 4, 28));
    expect(fixtureIndex.some((s) => s.lineId === r.lineId)).toBe(true);
  });

  it('different dates pick (likely) different records over a long range', () => {
    const seen = new Set<number>();
    for (let d = 1; d <= 28; d++) {
      seen.add(getDailyPuzzle(fixtureIndex, new Date(2026, 4, d)).lineId);
    }
    // With 28 dates and 4 buckets, at least 2 distinct picks must appear.
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });
});

describe('getRandomPuzzle', () => {
  it('uses the injected rng to pick an index', () => {
    expect(getRandomPuzzle(fixtureIndex, () => 0).lineId).toBe(11);
    expect(getRandomPuzzle(fixtureIndex, () => 0.9999).lineId).toBe(22);
    expect(getRandomPuzzle(fixtureIndex, () => 0.5).lineId).toBe(21);
  });

  it('defaults to Math.random when no rng is provided', () => {
    const r = getRandomPuzzle(fixtureIndex);
    expect(fixtureIndex).toContainEqual(r);
  });
});

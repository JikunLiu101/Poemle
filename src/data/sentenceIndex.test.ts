import { describe, expect, it } from 'vitest';
import { sentenceIndex } from './sentenceIndex';

describe('sentenceIndex', () => {
  it('flattens every line of every poem into a single array of ≥ 1500 records', () => {
    // The plan requires ≥ 1500 lines after the full dataset is curated (Task 25).
    expect(sentenceIndex.length).toBeGreaterThanOrEqual(1500);
  });

  it('records carry poemId, lineId, and non-empty text', () => {
    const first = sentenceIndex[0];
    expect(first.poemId).toBe(1);
    expect(typeof first.lineId).toBe('number');
    expect(first.text.length).toBeGreaterThan(0);
  });

  it('all lineIds are globally unique', () => {
    const ids = sentenceIndex.map((r) => r.lineId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is frozen', () => {
    expect(Object.isFrozen(sentenceIndex)).toBe(true);
  });
});

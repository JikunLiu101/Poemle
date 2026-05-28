import { describe, expect, it } from 'vitest';
import { sentenceIndex } from './sentenceIndex';

describe('sentenceIndex', () => {
  it('flattens every line of every poem into a single array', () => {
    // Seed dataset (Task 2) has 4 + 4 + 4 + 7 + 7 = 26 lines.
    expect(sentenceIndex.length).toBe(26);
  });

  it('records carry poemId, lineId, and text', () => {
    const first = sentenceIndex[0];
    expect(first.poemId).toBe(1);
    expect(first.lineId).toBe(101);
    expect(first.text).toBe('床前明月光');
  });

  it('all lineIds are globally unique', () => {
    const ids = sentenceIndex.map((r) => r.lineId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is frozen', () => {
    expect(Object.isFrozen(sentenceIndex)).toBe(true);
  });
});

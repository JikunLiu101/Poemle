import { PUNCTUATION_SET } from '../engine/constants';
import { sentenceIndex } from './sentenceIndex';

const TOP_N = 40;

function compute(): ReadonlyArray<string> {
  const counts = new Map<string, number>();
  for (const { text } of sentenceIndex) {
    for (const ch of text) {
      if (PUNCTUATION_SET.has(ch)) continue;
      counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
  }
  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_N)
    .map(([ch]) => ch);
  return Object.freeze(ranked);
}

export const COMMON_CHARS: ReadonlyArray<string> = compute();

import type { SentenceRecord } from '../types';
import { fnv1a32 } from './hash';

export function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function getDailyPuzzle(
  index: ReadonlyArray<SentenceRecord>,
  date: Date = new Date(),
): SentenceRecord {
  if (index.length === 0) throw new Error('getDailyPuzzle: empty index');
  const key = formatYYYYMMDD(date);
  const i = fnv1a32(key) % index.length;
  return index[i];
}

export function getRandomPuzzle(
  index: ReadonlyArray<SentenceRecord>,
  rng: () => number = Math.random,
): SentenceRecord {
  if (index.length === 0) throw new Error('getRandomPuzzle: empty index');
  const i = Math.floor(rng() * index.length);
  // Guard against rng() === 1.0 (rare but possible per the spec of Math.random).
  return index[Math.min(i, index.length - 1)];
}

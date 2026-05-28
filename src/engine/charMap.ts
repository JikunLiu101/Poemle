import type { CharStatus } from '../types';

const RANK: Record<CharStatus, number> = {
  unknown: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

function better(a: CharStatus | undefined, b: CharStatus): CharStatus {
  if (a === undefined) return b;
  return RANK[b] > RANK[a] ? b : a;
}

export function updateCharMap(
  prev: Record<string, CharStatus>,
  guess: string,
  statuses: CharStatus[],
): Record<string, CharStatus> {
  if (guess.length !== statuses.length) {
    throw new Error('updateCharMap: guess/statuses length mismatch');
  }
  const next: Record<string, CharStatus> = { ...prev };
  for (let i = 0; i < guess.length; i++) {
    const ch = guess[i];
    next[ch] = better(next[ch], statuses[i]);
  }
  return next;
}

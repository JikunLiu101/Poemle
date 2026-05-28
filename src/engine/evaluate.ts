import type { CharStatus } from '../types';

/**
 * Wordle-style two-pass evaluation. Pass 1 marks exact matches and removes
 * them from the answer pool. Pass 2 marks present/absent against the
 * remaining pool. This correctly handles repeated characters: the pool
 * tracks how many of each character are still "available" to match.
 */
export function evaluateGuess(guess: string, answer: string): CharStatus[] {
  if (guess.length !== answer.length) {
    throw new Error(
      `evaluateGuess: length mismatch (guess=${guess.length}, answer=${answer.length})`,
    );
  }
  const n = guess.length;
  const result: CharStatus[] = new Array(n).fill('absent');
  const pool = new Map<string, number>();

  // Pass 1: exact matches.
  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
    } else {
      pool.set(answer[i], (pool.get(answer[i]) ?? 0) + 1);
    }
  }

  // Pass 2: present / absent.
  for (let i = 0; i < n; i++) {
    if (result[i] === 'correct') continue;
    const ch = guess[i];
    const remaining = pool.get(ch) ?? 0;
    if (remaining > 0) {
      result[i] = 'present';
      pool.set(ch, remaining - 1);
    }
  }
  return result;
}

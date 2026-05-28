import type { PuzzleState } from '../types';
import { STORAGE_KEY } from '../engine/constants';

export function savePuzzleState(state: PuzzleState): void {
  try {
    const { currentInput: _ignored, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    // Quota exceeded or storage unavailable — silently no-op. The game still
    // works in-memory; the next mutation will retry.
  }
}

export function loadPuzzleState(): PuzzleState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as Omit<PuzzleState, 'currentInput'>;
    return { ...parsed, currentInput: '' };
  } catch {
    return null;
  }
}

export function clearPuzzleState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

import { beforeEach, describe, expect, it } from 'vitest';
import type { PuzzleState } from '../types';
import { clearPuzzleState, loadPuzzleState, savePuzzleState } from './storage';
import { STORAGE_KEY } from '../engine/constants';

class FakeStorage {
  private bag = new Map<string, string>();
  getItem(k: string) { return this.bag.has(k) ? this.bag.get(k)! : null; }
  setItem(k: string, v: string) { this.bag.set(k, v); }
  removeItem(k: string) { this.bag.delete(k); }
  clear() { this.bag.clear(); }
}

const state: PuzzleState = {
  mode: 'daily',
  sentenceId: 101,
  answer: '床前明月光',
  guesses: ['月光床前明'],
  cellStatuses: [['present', 'present', 'present', 'present', 'present']],
  charMap: { 月: 'present', 光: 'present', 床: 'present', 前: 'present', 明: 'present' },
  currentInput: 'AB',          // must be stripped on save
  gameOver: false,
  won: false,
};

beforeEach(() => {
  // Provide a fresh fake `localStorage` for each test.
  (globalThis as any).localStorage = new FakeStorage();
});

describe('storage', () => {
  it('savePuzzleState strips currentInput', () => {
    savePuzzleState(state);
    const raw = localStorage.getItem(STORAGE_KEY)!;
    expect(JSON.parse(raw).currentInput).toBeUndefined();
  });

  it('loadPuzzleState restores fields and resets currentInput to empty string', () => {
    savePuzzleState(state);
    const loaded = loadPuzzleState()!;
    expect(loaded.answer).toBe('床前明月光');
    expect(loaded.guesses).toEqual(['月光床前明']);
    expect(loaded.currentInput).toBe('');
  });

  it('loadPuzzleState returns null when no entry exists', () => {
    expect(loadPuzzleState()).toBeNull();
  });

  it('loadPuzzleState returns null on parse error', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadPuzzleState()).toBeNull();
  });

  it('clearPuzzleState removes the key', () => {
    savePuzzleState(state);
    clearPuzzleState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

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
  answerFull: '床前明月光，',
  guesses: ['月光床前明'],
  cellStatuses: [['present', 'present', 'present', 'present', 'present']],
  charMap: { 月: 'present', 光: 'present', 床: 'present', 前: 'present', 明: 'present' },
  currentInput: 'AB',          // must be stripped on save
  revealedPositions: [0, 2],
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

  it('loadPuzzleState defaults revealedPositions to [] for pre-hint saves', () => {
    const legacy = {
      mode: 'daily',
      sentenceId: 1,
      answer: '床前明月光',
      guesses: [],
      cellStatuses: [],
      charMap: {},
      gameOver: false,
      won: false,
      // No revealedPositions field — predates the hint feature.
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const loaded = loadPuzzleState()!;
    expect(loaded.revealedPositions).toEqual([]);
  });

  it('loadPuzzleState defaults answerFull to answer for pre-punctuation saves', () => {
    const legacy = {
      mode: 'daily',
      sentenceId: 1,
      answer: '床前明月光',
      guesses: [],
      cellStatuses: [],
      charMap: {},
      revealedPositions: [],
      gameOver: false,
      won: false,
      // No answerFull field.
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const loaded = loadPuzzleState()!;
    expect(loaded.answerFull).toBe('床前明月光');
  });

  it('loadPuzzleState returns null on structurally invalid saves', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answer: 42 }));
    expect(loadPuzzleState()).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import type { PuzzleState, SentenceRecord } from '../types';
import { reducer } from './useGameState';

function makeState(over: Partial<PuzzleState> = {}): PuzzleState {
  return {
    mode: 'random',
    sentenceId: 1,
    answer: '床前明月光',
    guesses: [],
    cellStatuses: [],
    charMap: {},
    currentInput: '',
    revealedPositions: [],
    gameOver: false,
    won: false,
    ...over,
  };
}

const record: SentenceRecord = { poemId: 1, lineId: 1, text: '床前明月光' };

describe('reducer', () => {
  it('START_PUZZLE initialises revealedPositions to []', () => {
    const next = reducer(null, { type: 'START_PUZZLE', mode: 'daily', record });
    expect(next?.revealedPositions).toEqual([]);
  });

  it('SUBMIT_GUESS does NOT end the game just because of attempt count', () => {
    const state = makeState({
      guesses: Array(10).fill('XXXXX'),
      cellStatuses: Array(10).fill(['absent', 'absent', 'absent', 'absent', 'absent']),
      currentInput: 'YYYYY',
    });
    const next = reducer(state, { type: 'SUBMIT_GUESS' });
    // 11 wrong guesses — still not game over (limit removed).
    expect(next?.gameOver).toBe(false);
  });

  it('SUBMIT_GUESS ends the game with won=true on a correct guess', () => {
    const state = makeState({ currentInput: '床前明月光' });
    const next = reducer(state, { type: 'SUBMIT_GUESS' });
    expect(next?.gameOver).toBe(true);
    expect(next?.won).toBe(true);
  });

  it('REVEAL_HINT adds one position to revealedPositions, sorted ascending', () => {
    const state = makeState();
    const a = reducer(state, { type: 'REVEAL_HINT' });
    const b = reducer(a, { type: 'REVEAL_HINT' });
    expect(a?.revealedPositions).toEqual([0]);
    expect(b?.revealedPositions).toEqual([0, 1]);
  });

  it('REVEAL_HINT promotes the revealed char to "correct" in charMap', () => {
    const state = makeState({ charMap: { 床: 'absent' } });
    const next = reducer(state, { type: 'REVEAL_HINT' });
    expect(next?.charMap.床).toBe('correct');
  });

  it('REVEAL_HINT skips positions already correct in history', () => {
    // Pre-mark position 0 as correct via cellStatuses (simulating a partial win).
    const state = makeState({
      guesses: ['床XXXX'],
      cellStatuses: [['correct', 'absent', 'absent', 'absent', 'absent']],
    });
    const next = reducer(state, { type: 'REVEAL_HINT' });
    // Position 0 already known correct, so hint should pick position 1 instead.
    expect(next?.revealedPositions).toEqual([1]);
  });

  it('REVEAL_HINT once all positions are accounted for sets gameOver=true, won=false', () => {
    const state = makeState({
      revealedPositions: [0, 1, 2, 3, 4], // all 5 positions revealed
    });
    const next = reducer(state, { type: 'REVEAL_HINT' });
    expect(next?.gameOver).toBe(true);
    expect(next?.won).toBe(false);
  });

  it('REVEAL_HINT is a no-op once gameOver is true', () => {
    const state = makeState({ gameOver: true });
    const next = reducer(state, { type: 'REVEAL_HINT' });
    expect(next).toBe(state);
  });
});

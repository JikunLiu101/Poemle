import { useEffect, useReducer, type Dispatch } from 'react';
import type { CharStatus, PuzzleState, SentenceRecord } from '../types';
import { onlyCJK } from '../engine/cjk';
import { evaluateGuess } from '../engine/evaluate';
import { updateCharMap } from '../engine/charMap';
import { stripPunctuation } from '../engine/punctuation';
import { formatYYYYMMDD } from '../engine/puzzle';
import {
  clearPuzzleState,
  loadPuzzleState,
  savePuzzleState,
} from '../persistence/storage';

export type Action =
  | { type: 'START_PUZZLE'; mode: 'daily' | 'random'; record: SentenceRecord }
  | { type: 'UPDATE_INPUT'; input: string }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'REVEAL_HINT' }
  | { type: 'RESET' };

export type State = PuzzleState | null;

const EMPTY: State = null;

function startState(
  mode: 'daily' | 'random',
  record: SentenceRecord,
): PuzzleState {
  const { clean } = stripPunctuation(record.text);
  return {
    mode,
    sentenceId: record.lineId,
    answer: clean,
    answerFull: record.text,
    guesses: [],
    cellStatuses: [],
    charMap: {},
    currentInput: '',
    revealedPositions: [],
    puzzleDate: mode === 'daily' ? formatYYYYMMDD(new Date()) : undefined,
    gameOver: false,
    won: false,
  };
}

/**
 * Positions that the player has NOT yet locked in as 'correct' — either via
 * a successful submitted guess at that position OR via a previous hint.
 */
function unsolvedPositions(state: PuzzleState): number[] {
  const correctInHistory = new Set<number>();
  for (const row of state.cellStatuses) {
    for (let i = 0; i < row.length; i++) {
      if (row[i] === 'correct') correctInHistory.add(i);
    }
  }
  const out: number[] = [];
  for (let i = 0; i < state.answer.length; i++) {
    if (correctInHistory.has(i)) continue;
    if (state.revealedPositions.includes(i)) continue;
    out.push(i);
  }
  return out;
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_PUZZLE':
      return startState(action.mode, action.record);

    case 'RESET':
      return EMPTY;

    case 'UPDATE_INPUT':
      if (!state || state.gameOver) return state;
      // No length truncation here — GuessInput's filterInput already caps
      // the CJK count and allows intra-sentence punctuation alongside it.
      return { ...state, currentInput: action.input };

    case 'SUBMIT_GUESS': {
      if (!state || state.gameOver) return state;
      // Strip punctuation from the visible input before evaluating; the
      // engine only operates on CJK characters.
      const guess = onlyCJK(state.currentInput);
      if (guess.length !== state.answer.length) return state;
      const statuses: CharStatus[] = evaluateGuess(guess, state.answer);
      const won = statuses.every((s) => s === 'correct');
      return {
        ...state,
        guesses: [...state.guesses, guess],
        cellStatuses: [...state.cellStatuses, statuses],
        charMap: updateCharMap(state.charMap, guess, statuses),
        currentInput: '',
        won,
        // Game ends on win only. There is no attempt cap; the player
        // surrenders explicitly via the hint button once every position
        // has already been revealed.
        gameOver: won,
      };
    }

    case 'REVEAL_HINT': {
      if (!state || state.gameOver) return state;
      const available = unsolvedPositions(state);
      if (available.length === 0) {
        // Every position is already known to the player. The next hint
        // click means "give up" — reveal the answer in the game-over panel.
        return { ...state, gameOver: true, won: false };
      }
      const pos = available[0];
      const ch = state.answer[pos];
      const revealedPositions = [...state.revealedPositions, pos].sort(
        (a, b) => a - b,
      );
      return {
        ...state,
        revealedPositions,
        // Promote the hint char in the keyboard panel too.
        charMap: updateCharMap(state.charMap, ch, ['correct']),
      };
    }

    default:
      return state;
  }
}

export interface UseGameState {
  state: State;
  dispatch: Dispatch<Action>;
}

export function useGameState(): UseGameState {
  // Lazy init: rehydrate from storage, but never auto-resume a completed game.
  const [state, dispatch] = useReducer(reducer, EMPTY, () => {
    const persisted = loadPuzzleState();
    if (!persisted) return EMPTY;
    if (persisted.gameOver) return EMPTY;
    return persisted;
  });

  // Persist on every semantically significant state transition.
  //
  // The deps array intentionally lists only scalars derived from `state` so
  // pure typing (which mutates only `currentInput`) does not write to
  // localStorage on every keystroke. The reducer guarantees referential
  // equality preservation outside those transitions, so the closure over
  // `state` here is safe.
  useEffect(() => {
    if (state === null) {
      clearPuzzleState();
    } else {
      savePuzzleState(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state?.mode,
    state?.sentenceId,
    state?.guesses.length,
    state?.revealedPositions.length,
    state?.gameOver,
    state?.won,
  ]);

  return { state, dispatch };
}

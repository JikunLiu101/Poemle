import { useEffect, useReducer, type Dispatch } from 'react';
import type { CharStatus, PuzzleState, SentenceRecord } from '../types';
import { MAX_ATTEMPTS } from '../engine/constants';
import { evaluateGuess } from '../engine/evaluate';
import { updateCharMap } from '../engine/charMap';
import { stripPunctuation } from '../engine/punctuation';
import {
  clearPuzzleState,
  loadPuzzleState,
  savePuzzleState,
} from '../persistence/storage';

export type Action =
  | { type: 'START_PUZZLE'; mode: 'daily' | 'random'; record: SentenceRecord }
  | { type: 'UPDATE_INPUT'; input: string }
  | { type: 'SUBMIT_GUESS' }
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
    guesses: [],
    cellStatuses: [],
    charMap: {},
    currentInput: '',
    gameOver: false,
    won: false,
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_PUZZLE':
      return startState(action.mode, action.record);

    case 'RESET':
      return EMPTY;

    case 'UPDATE_INPUT':
      if (!state || state.gameOver) return state;
      // Constrain input length to the answer's guessable length.
      return { ...state, currentInput: action.input.slice(0, state.answer.length) };

    case 'SUBMIT_GUESS': {
      if (!state || state.gameOver) return state;
      const guess = state.currentInput;
      if (guess.length !== state.answer.length) return state;
      const statuses: CharStatus[] = evaluateGuess(guess, state.answer);
      const won = statuses.every((s) => s === 'correct');
      const guesses = [...state.guesses, guess];
      const gameOver = won || guesses.length >= MAX_ATTEMPTS;
      return {
        ...state,
        guesses,
        cellStatuses: [...state.cellStatuses, statuses],
        charMap: updateCharMap(state.charMap, guess, statuses),
        currentInput: '',
        won,
        gameOver,
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

  // Persist on every change except pure typing.
  useEffect(() => {
    if (state === null) {
      clearPuzzleState();
    } else {
      savePuzzleState(state);
    }
    // Intentionally exclude state.currentInput from the dependency array so
    // typing keystrokes don't write to localStorage on every character.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state?.mode,
    state?.sentenceId,
    state?.guesses.length,
    state?.gameOver,
    state?.won,
  ]);

  return { state, dispatch };
}

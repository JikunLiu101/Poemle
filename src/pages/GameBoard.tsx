import type { Action, State } from '../hooks/useGameState';
import type { Dispatch } from 'react';
import { GuessHistory } from '../components/GuessHistory';
import { PreviewRow } from '../components/PreviewRow';
import { GuessInput } from '../components/GuessInput';
import { CharacterTable } from '../components/CharacterTable';

export interface GameBoardProps {
  state: NonNullable<State>;
  dispatch: Dispatch<Action>;
}

export function GameBoard({ state, dispatch }: GameBoardProps) {
  const length = state.answer.length;

  return (
    <section className="flex flex-col items-center gap-6 py-6">
      <p className="text-sm text-[#818384]">
        {state.mode === 'daily' ? '今日詩題' : '隨機一題'} · {length} 字
      </p>

      <GuessHistory
        guesses={state.guesses}
        cellStatuses={state.cellStatuses}
      />

      <PreviewRow
        length={length}
        input={state.currentInput}
        charMap={state.charMap}
        cellStatuses={state.cellStatuses}
        guesses={state.guesses}
      />

      <GuessInput
        length={length}
        value={state.currentInput}
        disabled={state.gameOver}
        onChange={(input) => dispatch({ type: 'UPDATE_INPUT', input })}
        onSubmit={() => dispatch({ type: 'SUBMIT_GUESS' })}
      />

      <div className="w-full max-w-md mt-4">
        <CharacterTable charMap={state.charMap} />
      </div>
    </section>
  );
}

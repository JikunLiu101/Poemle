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

function formatPuzzleDate(yyyymmdd: string | undefined): string | null {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null;
  const y = yyyymmdd.slice(0, 4);
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  return `${y}年${m}月${d}日`;
}

export function GameBoard({ state, dispatch }: GameBoardProps) {
  const length = state.answer.length;
  const dateLabel = formatPuzzleDate(state.puzzleDate);
  const modeLabel =
    state.mode === 'daily'
      ? `今日诗题${dateLabel ? ` · ${dateLabel}` : ''}`
      : '随机一题';

  return (
    <section className="flex flex-col items-center gap-6 py-6">
      <div className="w-full flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET' })}
          className="text-sm text-[#9a8870] hover:text-white transition-colors"
          aria-label="返回首页"
        >
          ← 返回
        </button>
        <p className="text-sm text-[#9a8870]">
          {modeLabel} · {length} 字
        </p>
        <span aria-hidden className="w-12" />
      </div>

      <GuessHistory
        guesses={state.guesses}
        cellStatuses={state.cellStatuses}
        answerFull={state.answerFull}
      />

      <PreviewRow
        input={state.currentInput}
        answer={state.answer}
        answerFull={state.answerFull}
        charMap={state.charMap}
        cellStatuses={state.cellStatuses}
        guesses={state.guesses}
        revealedPositions={state.revealedPositions}
      />

      <GuessInput
        length={length}
        value={state.currentInput}
        disabled={state.gameOver}
        onChange={(input) => dispatch({ type: 'UPDATE_INPUT', input })}
        onSubmit={() => dispatch({ type: 'SUBMIT_GUESS' })}
      />

      <button
        type="button"
        onClick={() => dispatch({ type: 'REVEAL_HINT' })}
        disabled={state.gameOver}
        className="btn-secondary text-sm"
      >
        提示
      </button>

      <div className="w-full max-w-md mt-4">
        <CharacterTable charMap={state.charMap} />
      </div>
    </section>
  );
}

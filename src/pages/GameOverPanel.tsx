import { useMemo } from 'react';
import type { PuzzleState } from '../types';
import { poems } from '../data';

export interface GameOverPanelProps {
  state: PuzzleState;
  onNewRandomGame: () => void;
}

export function GameOverPanel({ state, onNewRandomGame }: GameOverPanelProps) {
  const poem = useMemo(
    () => poems.find((p) => p.lines.some((l) => l.id === state.sentenceId)),
    [state.sentenceId],
  );

  return (
    <section className="flex flex-col items-center gap-6 py-12 text-center">
      <h2 className="text-3xl font-bold">
        {state.won ? '答對了!' : '挑戰結束'}
      </h2>
      <p className="text-xl">答案: {state.answer}</p>

      {poem && (
        <article className="max-w-md">
          <h3 className="text-xl font-semibold">{poem.title}</h3>
          <p className="text-sm text-[#818384]">
            {poem.author} · {poem.dynasty === 'tang' ? '唐' : '宋'}
          </p>
          <div className="mt-3 flex flex-col gap-1">
            {poem.lines.map((l) => (
              <p key={l.id} className="text-lg">{l.text}</p>
            ))}
          </div>
        </article>
      )}

      <button onClick={onNewRandomGame} className="btn-primary">
        再來一題
      </button>
    </section>
  );
}

import { useMemo } from 'react';
import type { PuzzleState } from '../types';
import { poems } from '../data';

export interface GameOverPanelProps {
  state: PuzzleState;
  onNewRandomGame: () => void;
  onBackToLanding: () => void;
}

export function GameOverPanel({
  state,
  onNewRandomGame,
  onBackToLanding,
}: GameOverPanelProps) {
  const poem = useMemo(
    () => poems.find((p) => p.lines.some((l) => l.id === state.sentenceId)),
    [state.sentenceId],
  );

  return (
    <section className="flex flex-col items-center gap-6 py-12 text-center">
      <h2 className="text-3xl font-bold">
        {state.won ? '答对了!' : '挑战结束'}
      </h2>
      <p className="text-sm text-[#9a8870]">
        尝试 {state.guesses.length} 次 · 提示 {state.revealedPositions.length} 字
      </p>
      <p className="text-xl">答案: {state.answerFull}</p>

      {poem && (
        <article className="max-w-md">
          <h3 className="text-xl font-semibold">{poem.title}</h3>
          <p className="text-sm text-[#9a8870]">
            {poem.author} · {poem.dynasty === 'tang' ? '唐' : '宋'}
          </p>
          <div className="mt-3 flex flex-col gap-1">
            {poem.lines.map((l) => {
              const isAnswer = l.id === state.sentenceId;
              return (
                <p
                  key={l.id}
                  className={
                    isAnswer
                      ? 'text-lg font-bold text-correct'
                      : 'text-lg'
                  }
                >
                  {l.text}
                </p>
              );
            })}
          </div>
        </article>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onNewRandomGame} className="btn-primary">
          再来一题
        </button>
        <button onClick={onBackToLanding} className="btn-secondary">
          返回首页
        </button>
      </div>
    </section>
  );
}

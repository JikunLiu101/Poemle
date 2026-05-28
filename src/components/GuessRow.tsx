import type { CharStatus } from '../types';
import { CJK_RE } from '../engine/cjk';
import { CharCell } from './CharCell';

export interface GuessRowProps {
  /** N CJK characters — what the player typed. */
  guess: string;
  /** N statuses aligned to `guess`. */
  statuses: CharStatus[];
  /** Original sentence (length = N + P) used to interleave punctuation. */
  answerFull: string;
}

export function GuessRow({ guess, statuses, answerFull }: GuessRowProps) {
  type Cell = { key: number; char: string; status: CharStatus; readOnly: boolean };
  const cells: Cell[] = [];
  let cjkIdx = 0;
  for (let i = 0; i < answerFull.length; i++) {
    const ch = answerFull[i];
    if (!CJK_RE.test(ch)) {
      cells.push({ key: i, char: ch, status: 'unknown', readOnly: true });
      continue;
    }
    cells.push({
      key: i,
      char: guess[cjkIdx] ?? '',
      status: statuses[cjkIdx] ?? 'unknown',
      readOnly: false,
    });
    cjkIdx++;
  }

  return (
    <div className="flex gap-1 justify-center flex-wrap">
      {cells.map(({ key, char, status, readOnly }) => (
        <CharCell key={key} char={char} status={status} readOnly={readOnly} />
      ))}
    </div>
  );
}

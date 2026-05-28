import type { CharStatus } from '../types';
import { GuessRow } from './GuessRow';

export interface GuessHistoryProps {
  guesses: string[];
  cellStatuses: CharStatus[][];
  /** Original sentence (with intra-sentence punctuation) so each history
   *  row can align CJK guess characters with the punctuation slots. */
  answerFull: string;
}

export function GuessHistory({
  guesses,
  cellStatuses,
  answerFull,
}: GuessHistoryProps) {
  return (
    <div className="flex flex-col gap-1">
      {guesses.map((g, i) => (
        <GuessRow
          key={i}
          guess={g}
          statuses={cellStatuses[i] ?? []}
          answerFull={answerFull}
        />
      ))}
    </div>
  );
}

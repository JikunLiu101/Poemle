import type { CharStatus } from '../types';
import { GuessRow } from './GuessRow';

export interface GuessHistoryProps {
  guesses: string[];
  cellStatuses: CharStatus[][];
}

export function GuessHistory({ guesses, cellStatuses }: GuessHistoryProps) {
  return (
    <div className="flex flex-col gap-1">
      {guesses.map((g, i) => (
        <GuessRow key={i} guess={g} statuses={cellStatuses[i] ?? []} />
      ))}
    </div>
  );
}

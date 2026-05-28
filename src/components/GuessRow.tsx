import type { CharStatus } from '../types';
import { CharCell } from './CharCell';

export interface GuessRowProps {
  guess: string;
  statuses: CharStatus[];
}

export function GuessRow({ guess, statuses }: GuessRowProps) {
  return (
    <div className="flex gap-1 justify-center">
      {[...guess].map((ch, i) => (
        <CharCell key={i} char={ch} status={statuses[i]} />
      ))}
    </div>
  );
}

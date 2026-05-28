import type { CharStatus } from '../types';
import { CharCell } from './CharCell';

export interface PreviewRowProps {
  length: number;
  input: string;
  charMap: Record<string, CharStatus>;
  cellStatuses: CharStatus[][];
  guesses: string[];
}

function knownCorrectAt(
  i: number,
  cellStatuses: CharStatus[][],
  guesses: string[],
): string | null {
  for (let r = 0; r < cellStatuses.length; r++) {
    if (cellStatuses[r][i] === 'correct') {
      return guesses[r][i] ?? null;
    }
  }
  return null;
}

export function PreviewRow({
  length,
  input,
  charMap,
  cellStatuses,
  guesses,
}: PreviewRowProps) {
  const slots = Array.from({ length }, (_, i) => {
    const typed = input[i] ?? '';
    const fixed = knownCorrectAt(i, cellStatuses, guesses);

    let status: CharStatus = 'unknown';
    let display = typed;

    if (typed && charMap[typed] === 'absent') {
      status = 'absent';
    } else if (fixed && typed === fixed) {
      status = 'correct';
    }

    return { display, status, i };
  });

  return (
    <div className="flex gap-1 justify-center">
      {slots.map(({ display, status, i }) => (
        <CharCell key={i} char={display} status={status} />
      ))}
    </div>
  );
}

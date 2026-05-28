import type { CharStatus } from '../types';
import { CharCell } from './CharCell';

export interface PreviewRowProps {
  length: number;
  input: string;
  answer: string;
  charMap: Record<string, CharStatus>;
  cellStatuses: CharStatus[][];
  guesses: string[];
  revealedPositions: number[];
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
  answer,
  charMap,
  cellStatuses,
  guesses,
  revealedPositions,
}: PreviewRowProps) {
  const revealedSet = new Set(revealedPositions);
  const slots = Array.from({ length }, (_, i) => {
    // Hint-revealed positions always show the answer character in 'correct'
    // styling, overriding whatever the player typed at that slot.
    if (revealedSet.has(i)) {
      return { display: answer[i] ?? '', status: 'correct' as CharStatus, i };
    }
    const typed = input[i] ?? '';
    const fixed = knownCorrectAt(i, cellStatuses, guesses);
    let status: CharStatus = 'unknown';
    if (typed && charMap[typed] === 'absent') {
      status = 'absent';
    } else if (fixed && typed === fixed) {
      status = 'correct';
    }
    return { display: typed, status, i };
  });

  return (
    <div className="flex gap-1 justify-center">
      {slots.map(({ display, status, i }) => (
        <CharCell key={i} char={display} status={status} />
      ))}
    </div>
  );
}

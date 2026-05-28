import type { CharStatus } from '../types';
import { CJK_RE, onlyCJK } from '../engine/cjk';
import { CharCell } from './CharCell';

export interface PreviewRowProps {
  /** Original sentence including intra-sentence punctuation. */
  answerFull: string;
  /** CJK-only answer text. */
  answer: string;
  input: string;
  charMap: Record<string, CharStatus>;
  cellStatuses: CharStatus[][];
  guesses: string[];
  revealedPositions: number[];
}

function knownCorrectAt(
  cjkIdx: number,
  cellStatuses: CharStatus[][],
  guesses: string[],
): string | null {
  for (let r = 0; r < cellStatuses.length; r++) {
    if (cellStatuses[r][cjkIdx] === 'correct') {
      return guesses[r][cjkIdx] ?? null;
    }
  }
  return null;
}

export function PreviewRow({
  answerFull,
  answer,
  input,
  charMap,
  cellStatuses,
  guesses,
  revealedPositions,
}: PreviewRowProps) {
  const revealedSet = new Set(revealedPositions);
  const cjkInput = onlyCJK(input);

  type Slot = { key: number; display: string; status: CharStatus; readOnly: boolean };
  const slots: Slot[] = [];
  let cjkIdx = 0;

  for (let i = 0; i < answerFull.length; i++) {
    const ch = answerFull[i];
    if (!CJK_RE.test(ch)) {
      // Pre-filled punctuation cell — read-only.
      slots.push({ key: i, display: ch, status: 'unknown', readOnly: true });
      continue;
    }
    if (revealedSet.has(cjkIdx)) {
      slots.push({
        key: i,
        display: answer[cjkIdx] ?? '',
        status: 'correct',
        readOnly: false,
      });
    } else {
      const typed = cjkInput[cjkIdx] ?? '';
      const fixed = knownCorrectAt(cjkIdx, cellStatuses, guesses);
      let status: CharStatus = 'unknown';
      if (typed && charMap[typed] === 'absent') {
        status = 'absent';
      } else if (fixed && typed === fixed) {
        status = 'correct';
      }
      slots.push({ key: i, display: typed, status, readOnly: false });
    }
    cjkIdx++;
  }

  return (
    <div className="flex gap-1 justify-center flex-wrap">
      {slots.map(({ key, display, status, readOnly }) => (
        <CharCell key={key} char={display} status={status} readOnly={readOnly} />
      ))}
    </div>
  );
}

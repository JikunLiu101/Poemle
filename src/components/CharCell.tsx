import type { CharStatus } from '../types';

const STATUS_BG: Record<CharStatus, string> = {
  correct: 'bg-correct border-correct',
  present: 'bg-present border-present',
  absent: 'bg-absent border-absent',
  unknown: 'bg-cell border-[#3a3a3c]',
};

export interface CharCellProps {
  char?: string;
  status?: CharStatus;
  /** If true, render slightly muted (used for pre-filled punctuation). */
  readOnly?: boolean;
}

export function CharCell({
  char = '',
  status = 'unknown',
  readOnly = false,
}: CharCellProps) {
  return (
    <span
      className={`cell-base ${STATUS_BG[status]} ${
        readOnly ? 'opacity-70' : ''
      }`}
    >
      {char}
    </span>
  );
}

import type { CharStatus } from '../types';

const STATUS_BG: Record<CharStatus, string> = {
  correct: 'bg-correct border-correct',
  present: 'bg-present border-present',
  absent: 'bg-absent border-absent',
  unknown: 'bg-cell border-[#3a3a3c]',
};

const SIZE_CLS = {
  // Default cell used by the guess history, preview row, and current input.
  md: 'w-11 h-11 sm:w-14 sm:h-14 text-xl border-2',
  // Compact cell used by the common-character reference grid so 40 cells
  // can fit on narrow viewports without overlapping.
  sm: 'w-8 h-8 sm:w-10 sm:h-10 text-base border',
} as const;

export type CharCellSize = keyof typeof SIZE_CLS;

export interface CharCellProps {
  char?: string;
  status?: CharStatus;
  /** If true, render slightly muted (used for pre-filled punctuation). */
  readOnly?: boolean;
  size?: CharCellSize;
}

export function CharCell({
  char = '',
  status = 'unknown',
  readOnly = false,
  size = 'md',
}: CharCellProps) {
  return (
    <span
      className={`cell-base ${SIZE_CLS[size]} ${STATUS_BG[status]} ${
        readOnly ? 'opacity-70' : ''
      }`}
    >
      {char}
    </span>
  );
}

// ─── Domain types ────────────────────────────────────────────────────────────

export type Dynasty = 'tang' | 'song';

export interface Line {
  id: number;
  text: string;
}

export interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: Dynasty;
  lines: Line[];
}

// ─── Puzzle / engine types ────────────────────────────────────────────────────

export interface SentenceRecord {
  poemId: number;
  lineId: number;
  text: string;
}

export type CharStatus = 'correct' | 'present' | 'absent' | 'unknown';

export type CellStatus = CharStatus;

export interface PuzzleState {
  mode: 'daily' | 'random';
  sentenceId: number;
  /** CJK-only — what the player actually types. Length = N. */
  answer: string;
  /** Original sentence including intra-sentence punctuation (，；：、). The
   *  preview/history rows render N + P cells against this string so commas
   *  appear as read-only slots. Length = N + P. */
  answerFull: string;
  guesses: string[];
  cellStatuses: CharStatus[][];
  charMap: Record<string, CharStatus>;
  currentInput: string;
  /** Sorted-ascending answer indices the player has had revealed via 提示. */
  revealedPositions: number[];
  /**
   * Local date the puzzle was started on, formatted as `YYYYMMDD`. Set only
   * when `mode === 'daily'`. Stored on state so the displayed date stays
   * aligned with the puzzle even if the player keeps playing past midnight.
   */
  puzzleDate?: string;
  gameOver: boolean;
  won: boolean;
}

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
  answer: string;
  guesses: string[];
  cellStatuses: CharStatus[][];
  charMap: Record<string, CharStatus>;
  currentInput: string;
  gameOver: boolean;
  won: boolean;
}

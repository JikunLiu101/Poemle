import type { CharStatus } from '../types';
import { COMMON_CHARS } from '../data/commonChars';
import { CharCell } from './CharCell';

export interface CharacterTableProps {
  charMap: Record<string, CharStatus>;
}

export function CharacterTable({ charMap }: CharacterTableProps) {
  return (
    <div
      className="grid gap-1 justify-center"
      style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
    >
      {COMMON_CHARS.map((ch) => (
        <CharCell key={ch} char={ch} status={charMap[ch] ?? 'unknown'} />
      ))}
    </div>
  );
}

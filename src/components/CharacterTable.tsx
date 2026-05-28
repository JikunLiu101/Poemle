import type { CharStatus } from '../types';
import { COMMON_CHARS } from '../data/commonChars';
import { CharCell } from './CharCell';

export interface CharacterTableProps {
  charMap: Record<string, CharStatus>;
}

export function CharacterTable({ charMap }: CharacterTableProps) {
  return (
    <div className="grid grid-cols-8 gap-1.5 justify-center mx-auto w-fit">
      {COMMON_CHARS.map((ch) => (
        <CharCell
          key={ch}
          char={ch}
          status={charMap[ch] ?? 'unknown'}
          size="sm"
        />
      ))}
    </div>
  );
}

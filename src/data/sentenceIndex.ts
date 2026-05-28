import type { SentenceRecord } from '../types';
import { poems } from './index';

function build(): ReadonlyArray<SentenceRecord> {
  const records: SentenceRecord[] = [];
  for (const poem of poems) {
    for (const line of poem.lines) {
      records.push({ poemId: poem.id, lineId: line.id, text: line.text });
    }
  }
  return Object.freeze(records);
}

export const sentenceIndex: ReadonlyArray<SentenceRecord> = build();

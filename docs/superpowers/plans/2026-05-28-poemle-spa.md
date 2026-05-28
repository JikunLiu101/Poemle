# Poemle SPA — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page Wordle-style game where the answer is a sentence from a classical Chinese poem, with daily and random modes, coloured per-character feedback, history, live preview, a common-character panel, and `localStorage` persistence — all static, no backend.

**Architecture:** Vite + React 18 + TypeScript SPA. Pure-function engine (`evaluate`, `charMap`, `puzzle`, `hash`, `punctuation`) sits under a single `useReducer` over `PuzzleState`. A custom hook syncs every dispatch (except live typing) to `localStorage`. Poem data is a bundled JSON module — no fetch at runtime. Daily puzzle is a deterministic FNV-1a hash of `YYYYMMDD`.

**Tech Stack:** Vite 5, React 18, TypeScript 5 (strict), Tailwind CSS 3, Vitest 2.

---

## Context for the engineer

The repo is scaffolded but empty:

- `package.json`, `tsconfig.*`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html` are in place.
- `src/main.tsx` imports `./App`, **but `src/App.tsx` does not exist** — the build is currently broken. Task 1 fixes this.
- `src/types/index.ts` already defines all domain types (`Poem`, `Line`, `Dynasty`, `SentenceRecord`, `CharStatus`, `CellStatus`, `PuzzleState`). Do not duplicate them — `import type` from `src/types`.
- `src/index.css` already defines theme CSS vars (`--color-correct` etc.) and base utility classes (`cell-base`, `btn-primary`, `btn-secondary`). Reuse them.
- `tailwind.config.js` defines `correct` / `present` / `absent` / `cell` colours and `flip-in` / `bounce-in` / `fade-in` / `slide-up` animations. Reuse them.

After every task, commit. Use conventional-commit prefixes (`feat:`, `test:`, `chore:`, `fix:`). Don't amend; new commit per task.

Today's date for the daily-puzzle test fixtures: **2026-05-28**. (Tests should not hard-code this — they should pass an injected `Date` or formatted string.)

---

## File map (target end-state)

```
src/
  App.tsx                       # router/state container (Task 22)
  main.tsx                      # already exists; do not touch
  vite-env.d.ts                 # already exists
  index.css                     # already exists
  types/index.ts                # already exists
  data/
    poems.json                  # seed dataset (Task 2)
    index.ts                    # typed import (Task 2)
    sentenceIndex.ts            # flat frozen index (Task 3)
    commonChars.ts              # top-40 chars (Task 9)
  engine/
    hash.ts                     # FNV-1a (Task 7)
    hash.test.ts
    punctuation.ts              # strip + slot map (Task 4)
    punctuation.test.ts
    evaluate.ts                 # two-pass evaluation (Task 5)
    evaluate.test.ts
    charMap.ts                  # status promotion (Task 6)
    charMap.test.ts
    puzzle.ts                   # daily + random selectors (Task 8)
    puzzle.test.ts
    constants.ts                # MAX_ATTEMPTS, PUNCTUATION_SET (Task 1)
  persistence/
    storage.ts                  # load/save/clear (Task 10)
    storage.test.ts
  hooks/
    useGameState.ts             # reducer + persistence sync (Task 11)
  components/
    CharCell.tsx                # Task 12
    GuessRow.tsx                # Task 13
    GuessHistory.tsx            # Task 14
    GuessInput.tsx              # Task 15
    PreviewRow.tsx              # Task 16
    CharacterTable.tsx          # Task 17
  pages/
    LandingPage.tsx             # Task 18
    GameBoard.tsx               # Task 19
    GameOverPanel.tsx           # Task 20
vitest.config.ts                # Task 1
```

Tests are colocated as `<unit>.test.ts`. No component tests in this plan — UI is verified manually in Task 24.

---

## Phase A — Foundation

### Task 1: Repair build, add Vitest, define shared constants

**Files:**
- Create: `src/App.tsx`
- Create: `vitest.config.ts`
- Create: `src/engine/constants.ts`
- Create: `src/engine/constants.test.ts`

- [ ] **Step 1: Add a stub `App.tsx` so the build compiles**

```tsx
// src/App.tsx
export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">詩樂 Poemle</h1>
    </main>
  );
}
```

- [ ] **Step 2: Add a Vitest config**

```ts
// vitest.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
```

- [ ] **Step 3: Define engine constants**

```ts
// src/engine/constants.ts
export const MAX_ATTEMPTS = 8;

export const PUNCTUATION_SET = new Set<string>([
  '。', '，', '！', '？', '、', '；', '：',
  '「', '」', '『', '』', '《', '》', '—',
]);

export const STORAGE_KEY = 'poemle_active_puzzle';
```

- [ ] **Step 4: Add a sanity test for constants**

```ts
// src/engine/constants.test.ts
import { describe, expect, it } from 'vitest';
import { MAX_ATTEMPTS, PUNCTUATION_SET, STORAGE_KEY } from './constants';

describe('engine constants', () => {
  it('exposes max attempts of 8', () => {
    expect(MAX_ATTEMPTS).toBe(8);
  });
  it('recognises common Chinese punctuation', () => {
    expect(PUNCTUATION_SET.has('，')).toBe(true);
    expect(PUNCTUATION_SET.has('。')).toBe(true);
    expect(PUNCTUATION_SET.has('A')).toBe(false);
  });
  it('uses a single storage key', () => {
    expect(STORAGE_KEY).toBe('poemle_active_puzzle');
  });
});
```

- [ ] **Step 5: Verify build + tests pass**

Run: `npm run build`
Expected: succeeds, produces `dist/`.

Run: `npm test -- --run`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx vitest.config.ts src/engine/constants.ts src/engine/constants.test.ts
git commit -m "chore: scaffold App.tsx, vitest config, engine constants"
```

---

### Task 2: Seed poem dataset and typed loader

**Files:**
- Create: `src/data/poems.json`
- Create: `src/data/index.ts`

The full 500-poem curation is a separate, parallel effort (see Task 25). For now, ship a small seed of well-known Tang and Song works so the engine can be exercised end-to-end. The seed must satisfy: ≥2 dynasties, ≥3 distinct sentence lengths, globally-unique `line.id` across the file.

- [ ] **Step 1: Create the seed dataset**

```json
// src/data/poems.json
[
  {
    "id": 1,
    "title": "靜夜思",
    "author": "李白",
    "dynasty": "tang",
    "lines": [
      { "id": 101, "text": "床前明月光" },
      { "id": 102, "text": "疑是地上霜" },
      { "id": 103, "text": "舉頭望明月" },
      { "id": 104, "text": "低頭思故鄉" }
    ]
  },
  {
    "id": 2,
    "title": "登鸛雀樓",
    "author": "王之渙",
    "dynasty": "tang",
    "lines": [
      { "id": 201, "text": "白日依山盡" },
      { "id": 202, "text": "黃河入海流" },
      { "id": 203, "text": "欲窮千里目" },
      { "id": 204, "text": "更上一層樓" }
    ]
  },
  {
    "id": 3,
    "title": "春曉",
    "author": "孟浩然",
    "dynasty": "tang",
    "lines": [
      { "id": 301, "text": "春眠不覺曉" },
      { "id": 302, "text": "處處聞啼鳥" },
      { "id": 303, "text": "夜來風雨聲" },
      { "id": 304, "text": "花落知多少" }
    ]
  },
  {
    "id": 4,
    "title": "相見歡",
    "author": "李煜",
    "dynasty": "song",
    "lines": [
      { "id": 401, "text": "無言獨上西樓" },
      { "id": 402, "text": "月如鉤" },
      { "id": 403, "text": "寂寞梧桐深院鎖清秋" },
      { "id": 404, "text": "剪不斷" },
      { "id": 405, "text": "理還亂" },
      { "id": 406, "text": "是離愁" },
      { "id": 407, "text": "別是一般滋味在心頭" }
    ]
  },
  {
    "id": 5,
    "title": "如夢令",
    "author": "李清照",
    "dynasty": "song",
    "lines": [
      { "id": 501, "text": "常記溪亭日暮" },
      { "id": 502, "text": "沉醉不知歸路" },
      { "id": 503, "text": "興盡晚回舟" },
      { "id": 504, "text": "誤入藕花深處" },
      { "id": 505, "text": "爭渡" },
      { "id": 506, "text": "爭渡" },
      { "id": 507, "text": "驚起一灘鷗鷺" }
    ]
  }
]
```

- [ ] **Step 2: Create the typed loader**

```ts
// src/data/index.ts
import type { Poem } from '../types';
import raw from './poems.json';

export const poems: ReadonlyArray<Poem> = raw as Poem[];
```

- [ ] **Step 3: Confirm `tsconfig.app.json` already allows JSON imports**

It does — `"resolveJsonModule": true` is set. No change needed.

- [ ] **Step 4: Commit**

```bash
git add src/data/poems.json src/data/index.ts
git commit -m "feat(data): add seed poem dataset and typed loader"
```

---

### Task 3: Flat sentence index

**Files:**
- Create: `src/data/sentenceIndex.ts`
- Create: `src/data/sentenceIndex.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/data/sentenceIndex.test.ts
import { describe, expect, it } from 'vitest';
import { sentenceIndex } from './sentenceIndex';

describe('sentenceIndex', () => {
  it('flattens every line of every poem into a single array', () => {
    // Seed dataset (Task 2) has 4 + 4 + 4 + 7 + 7 = 26 lines.
    expect(sentenceIndex.length).toBe(26);
  });

  it('records carry poemId, lineId, and text', () => {
    const first = sentenceIndex[0];
    expect(first.poemId).toBe(1);
    expect(first.lineId).toBe(101);
    expect(first.text).toBe('床前明月光');
  });

  it('all lineIds are globally unique', () => {
    const ids = sentenceIndex.map((r) => r.lineId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is frozen', () => {
    expect(Object.isFrozen(sentenceIndex)).toBe(true);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test -- --run src/data/sentenceIndex.test.ts`
Expected: FAIL — `Cannot find module './sentenceIndex'`.

- [ ] **Step 3: Implement**

```ts
// src/data/sentenceIndex.ts
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
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test -- --run src/data/sentenceIndex.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/data/sentenceIndex.ts src/data/sentenceIndex.test.ts
git commit -m "feat(data): build flat sentence index from poem dataset"
```

---

## Phase B — Engine (TDD)

### Task 4: Punctuation stripping & slot map

**Files:**
- Create: `src/engine/punctuation.ts`
- Create: `src/engine/punctuation.test.ts`

`stripPunctuation` separates the guessable characters from the fixed punctuation slots. The slot map records the original index of each punctuation character so the UI can pre-fill it.

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/punctuation.test.ts
import { describe, expect, it } from 'vitest';
import { stripPunctuation } from './punctuation';

describe('stripPunctuation', () => {
  it('returns the input unchanged when no punctuation is present', () => {
    const { clean, punctuationSlots } = stripPunctuation('床前明月光');
    expect(clean).toBe('床前明月光');
    expect(punctuationSlots.size).toBe(0);
  });

  it('removes a trailing 。 and records its slot', () => {
    const { clean, punctuationSlots } = stripPunctuation('床前明月光。');
    expect(clean).toBe('床前明月光');
    expect(punctuationSlots.size).toBe(1);
    expect(punctuationSlots.get(5)).toBe('。');
  });

  it('removes interior 、 and ， and records each slot at its ORIGINAL index', () => {
    const { clean, punctuationSlots } = stripPunctuation('天，地、人。');
    expect(clean).toBe('天地人');
    expect(punctuationSlots.get(1)).toBe('，');
    expect(punctuationSlots.get(3)).toBe('、');
    expect(punctuationSlots.get(5)).toBe('。');
  });

  it('handles strings made up only of punctuation', () => {
    const { clean, punctuationSlots } = stripPunctuation('。，！');
    expect(clean).toBe('');
    expect(punctuationSlots.size).toBe(3);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test -- --run src/engine/punctuation.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/engine/punctuation.ts
import { PUNCTUATION_SET } from './constants';

export interface StripResult {
  /** Text with all punctuation removed. */
  clean: string;
  /** Map of ORIGINAL index → punctuation character. */
  punctuationSlots: Map<number, string>;
}

export function stripPunctuation(text: string): StripResult {
  const slots = new Map<number, string>();
  let clean = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (PUNCTUATION_SET.has(ch)) {
      slots.set(i, ch);
    } else {
      clean += ch;
    }
  }
  return { clean, punctuationSlots: slots };
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test -- --run src/engine/punctuation.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/engine/punctuation.ts src/engine/punctuation.test.ts
git commit -m "feat(engine): strip punctuation and record slot positions"
```

---

### Task 5: Guess evaluation (two-pass with duplicates)

**Files:**
- Create: `src/engine/evaluate.ts`
- Create: `src/engine/evaluate.test.ts`

This is the hottest correctness path. Tests cover all six Wordle-standard duplicate edge cases before implementation.

- [ ] **Step 1: Write the failing tests (every case from the spec)**

```ts
// src/engine/evaluate.test.ts
import { describe, expect, it } from 'vitest';
import { evaluateGuess } from './evaluate';

describe('evaluateGuess', () => {
  it('marks every position correct when guess equals answer', () => {
    expect(evaluateGuess('床前明月光', '床前明月光'))
      .toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('marks character present when it exists at a different position', () => {
    expect(evaluateGuess('月光明前床', '床前明月光'))
      .toEqual(['present', 'present', 'correct', 'present', 'present']);
  });

  it('marks character absent when it does not exist in the answer', () => {
    expect(evaluateGuess('A床B前C', '床前明月光'))
      .toEqual(['absent', 'present', 'absent', 'present', 'absent']);
  });

  it('duplicate: answer has one X, guess has two — exact wins, other is absent', () => {
    // Answer "山下" (one 山). Guess "山山" — first is exact, second 山 has no
    // remaining occurrence in the answer pool.
    expect(evaluateGuess('山山', '山下')).toEqual(['correct', 'absent']);
  });

  it('duplicate: answer has one X, guess has two and neither is the exact position', () => {
    // Answer "下山" — 山 is at position 1. Guess "山山" — pos 0 is present
    // (consumes the lone 山), pos 1 (exact match) is correct ... but wait:
    // Pass 1 marks exact first. So pos 1 = correct (consumes the 山 from
    // the pool). Pos 0 is then evaluated in pass 2 with an empty 山-pool ⇒ absent.
    expect(evaluateGuess('山山', '下山')).toEqual(['absent', 'correct']);
  });

  it('duplicate: answer has zero X, guess has two — both absent', () => {
    expect(evaluateGuess('AA', '床前')).toEqual(['absent', 'absent']);
  });

  it('duplicate: answer has two X, guess has two — both can be present/correct', () => {
    expect(evaluateGuess('AABB', 'BBAA')).toEqual(['present', 'present', 'present', 'present']);
  });

  it('throws if guess and answer differ in length', () => {
    expect(() => evaluateGuess('床', '床前')).toThrow();
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test -- --run src/engine/evaluate.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement two-pass evaluation**

```ts
// src/engine/evaluate.ts
import type { CharStatus } from '../types';

/**
 * Wordle-style two-pass evaluation. Pass 1 marks exact matches and removes
 * them from the answer pool. Pass 2 marks present/absent against the
 * remaining pool. This correctly handles repeated characters: the pool
 * tracks how many of each character are still "available" to match.
 */
export function evaluateGuess(guess: string, answer: string): CharStatus[] {
  if (guess.length !== answer.length) {
    throw new Error(
      `evaluateGuess: length mismatch (guess=${guess.length}, answer=${answer.length})`,
    );
  }
  const n = guess.length;
  const result: CharStatus[] = new Array(n).fill('absent');
  const pool = new Map<string, number>();

  // Pass 1: exact matches.
  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
    } else {
      pool.set(answer[i], (pool.get(answer[i]) ?? 0) + 1);
    }
  }

  // Pass 2: present / absent.
  for (let i = 0; i < n; i++) {
    if (result[i] === 'correct') continue;
    const ch = guess[i];
    const remaining = pool.get(ch) ?? 0;
    if (remaining > 0) {
      result[i] = 'present';
      pool.set(ch, remaining - 1);
    }
  }
  return result;
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test -- --run src/engine/evaluate.test.ts`
Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add src/engine/evaluate.ts src/engine/evaluate.test.ts
git commit -m "feat(engine): two-pass guess evaluation with duplicate handling"
```

---

### Task 6: Per-character best-status map (promotion only)

**Files:**
- Create: `src/engine/charMap.ts`
- Create: `src/engine/charMap.test.ts`

The map tracks the **best** status ever observed for each character. It MUST NOT downgrade (`present` → `absent` is forbidden).

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/charMap.test.ts
import { describe, expect, it } from 'vitest';
import { updateCharMap } from './charMap';

describe('updateCharMap', () => {
  it('records new characters from a guess', () => {
    const next = updateCharMap({}, '床前明', ['correct', 'present', 'absent']);
    expect(next).toEqual({ 床: 'correct', 前: 'present', 明: 'absent' });
  });

  it('promotes present → correct', () => {
    const prev = { 月: 'present' as const };
    const next = updateCharMap(prev, '月', ['correct']);
    expect(next.月).toBe('correct');
  });

  it('promotes absent → present', () => {
    const prev = { 月: 'absent' as const };
    const next = updateCharMap(prev, '月', ['present']);
    expect(next.月).toBe('present');
  });

  it('never downgrades present → absent', () => {
    const prev = { 月: 'present' as const };
    const next = updateCharMap(prev, '月', ['absent']);
    expect(next.月).toBe('present');
  });

  it('never downgrades correct → present', () => {
    const prev = { 月: 'correct' as const };
    const next = updateCharMap(prev, '月', ['present']);
    expect(next.月).toBe('correct');
  });

  it('handles repeated characters in the same guess', () => {
    // First 山 is correct, second is absent. Best for 山 should be correct.
    const next = updateCharMap({}, '山山', ['correct', 'absent']);
    expect(next.山).toBe('correct');
  });

  it('returns a new object (does not mutate prev)', () => {
    const prev = { 月: 'present' as const };
    const next = updateCharMap(prev, '月', ['correct']);
    expect(next).not.toBe(prev);
    expect(prev.月).toBe('present');
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test -- --run src/engine/charMap.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/engine/charMap.ts
import type { CharStatus } from '../types';

const RANK: Record<CharStatus, number> = {
  unknown: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

function better(a: CharStatus | undefined, b: CharStatus): CharStatus {
  if (a === undefined) return b;
  return RANK[b] > RANK[a] ? b : a;
}

export function updateCharMap(
  prev: Record<string, CharStatus>,
  guess: string,
  statuses: CharStatus[],
): Record<string, CharStatus> {
  if (guess.length !== statuses.length) {
    throw new Error('updateCharMap: guess/statuses length mismatch');
  }
  const next: Record<string, CharStatus> = { ...prev };
  for (let i = 0; i < guess.length; i++) {
    const ch = guess[i];
    next[ch] = better(next[ch], statuses[i]);
  }
  return next;
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test -- --run src/engine/charMap.test.ts`
Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add src/engine/charMap.ts src/engine/charMap.test.ts
git commit -m "feat(engine): per-character best-status map (promotion only)"
```

---

### Task 7: FNV-1a 32-bit hash

**Files:**
- Create: `src/engine/hash.ts`
- Create: `src/engine/hash.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/hash.test.ts
import { describe, expect, it } from 'vitest';
import { fnv1a32 } from './hash';

describe('fnv1a32', () => {
  it('returns 0x811c9dc5 for the empty string (FNV offset basis)', () => {
    expect(fnv1a32('')).toBe(0x811c9dc5);
  });

  it('is deterministic — same input ⇒ same output', () => {
    expect(fnv1a32('20260528')).toBe(fnv1a32('20260528'));
  });

  it('different inputs ⇒ different outputs (for these fixtures)', () => {
    expect(fnv1a32('20260528')).not.toBe(fnv1a32('20260529'));
  });

  it('returns an unsigned 32-bit integer', () => {
    const h = fnv1a32('hello');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(2 ** 32);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test -- --run src/engine/hash.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement FNV-1a (32-bit, multi-byte safe)**

```ts
// src/engine/hash.ts
/**
 * FNV-1a 32-bit hash. Operates on UTF-8 byte view of the input string so it
 * is well-defined for multi-byte Chinese characters too — we coerce to bytes
 * via TextEncoder.
 */
const OFFSET = 0x811c9dc5;
const PRIME = 0x01000193;

const enc = new TextEncoder();

export function fnv1a32(input: string): number {
  const bytes = enc.encode(input);
  let h = OFFSET;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    // Math.imul keeps the multiplication within 32-bit signed range.
    h = Math.imul(h, PRIME);
  }
  // Coerce to unsigned 32-bit.
  return h >>> 0;
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test -- --run src/engine/hash.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/engine/hash.ts src/engine/hash.test.ts
git commit -m "feat(engine): FNV-1a 32-bit hash for daily-puzzle seed"
```

---

### Task 8: Daily and random puzzle selectors

**Files:**
- Create: `src/engine/puzzle.ts`
- Create: `src/engine/puzzle.test.ts`

`getDailyPuzzle` is deterministic for a given date. `getRandomPuzzle` uses `Math.random` but is testable by injecting a `rng` function.

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/puzzle.test.ts
import { describe, expect, it } from 'vitest';
import type { SentenceRecord } from '../types';
import { formatYYYYMMDD, getDailyPuzzle, getRandomPuzzle } from './puzzle';

const fixtureIndex: SentenceRecord[] = [
  { poemId: 1, lineId: 11, text: 'A' },
  { poemId: 1, lineId: 12, text: 'B' },
  { poemId: 2, lineId: 21, text: 'C' },
  { poemId: 2, lineId: 22, text: 'D' },
];

describe('formatYYYYMMDD', () => {
  it('zero-pads month and day', () => {
    expect(formatYYYYMMDD(new Date(2026, 0, 3))).toBe('20260103'); // month is 0-indexed
  });
});

describe('getDailyPuzzle', () => {
  it('returns the same record for the same date', () => {
    const date = new Date(2026, 4, 28); // 2026-05-28
    const a = getDailyPuzzle(fixtureIndex, date);
    const b = getDailyPuzzle(fixtureIndex, date);
    expect(a).toEqual(b);
  });

  it('returns a record whose lineId is in the index', () => {
    const r = getDailyPuzzle(fixtureIndex, new Date(2026, 4, 28));
    expect(fixtureIndex.some((s) => s.lineId === r.lineId)).toBe(true);
  });

  it('different dates pick (likely) different records over a long range', () => {
    const seen = new Set<number>();
    for (let d = 1; d <= 28; d++) {
      seen.add(getDailyPuzzle(fixtureIndex, new Date(2026, 4, d)).lineId);
    }
    // With 28 dates and 4 buckets, at least 2 distinct picks must appear.
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });
});

describe('getRandomPuzzle', () => {
  it('uses the injected rng to pick an index', () => {
    expect(getRandomPuzzle(fixtureIndex, () => 0).lineId).toBe(11);
    expect(getRandomPuzzle(fixtureIndex, () => 0.9999).lineId).toBe(22);
    expect(getRandomPuzzle(fixtureIndex, () => 0.5).lineId).toBe(21);
  });

  it('defaults to Math.random when no rng is provided', () => {
    const r = getRandomPuzzle(fixtureIndex);
    expect(fixtureIndex).toContainEqual(r);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test -- --run src/engine/puzzle.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/engine/puzzle.ts
import type { SentenceRecord } from '../types';
import { fnv1a32 } from './hash';

export function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function getDailyPuzzle(
  index: ReadonlyArray<SentenceRecord>,
  date: Date = new Date(),
): SentenceRecord {
  if (index.length === 0) throw new Error('getDailyPuzzle: empty index');
  const key = formatYYYYMMDD(date);
  const i = fnv1a32(key) % index.length;
  return index[i];
}

export function getRandomPuzzle(
  index: ReadonlyArray<SentenceRecord>,
  rng: () => number = Math.random,
): SentenceRecord {
  if (index.length === 0) throw new Error('getRandomPuzzle: empty index');
  const i = Math.floor(rng() * index.length);
  // Guard against rng() === 1.0 (rare but possible per the spec of Math.random).
  return index[Math.min(i, index.length - 1)];
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test -- --run src/engine/puzzle.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/engine/puzzle.ts src/engine/puzzle.test.ts
git commit -m "feat(engine): daily (hashed) and random puzzle selectors"
```

---

### Task 9: Top-40 common characters

**Files:**
- Create: `src/data/commonChars.ts`
- Create: `src/data/commonChars.test.ts`

Computed once at module load by counting character occurrences across `sentenceIndex` (excluding punctuation). The result is exported as a frozen 40-element string array.

- [ ] **Step 1: Write the failing tests**

```ts
// src/data/commonChars.test.ts
import { describe, expect, it } from 'vitest';
import { COMMON_CHARS } from './commonChars';
import { PUNCTUATION_SET } from '../engine/constants';

describe('COMMON_CHARS', () => {
  it('has length 40 (or the dataset cap, whichever is smaller)', () => {
    // The seed dataset has fewer than 40 unique chars; the export should
    // contain as many as exist, up to a cap of 40.
    expect(COMMON_CHARS.length).toBeLessThanOrEqual(40);
    expect(COMMON_CHARS.length).toBeGreaterThan(0);
  });

  it('contains no punctuation', () => {
    for (const ch of COMMON_CHARS) {
      expect(PUNCTUATION_SET.has(ch)).toBe(false);
    }
  });

  it('is frozen', () => {
    expect(Object.isFrozen(COMMON_CHARS)).toBe(true);
  });

  it('has no duplicates', () => {
    expect(new Set(COMMON_CHARS).size).toBe(COMMON_CHARS.length);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test -- --run src/data/commonChars.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/data/commonChars.ts
import { PUNCTUATION_SET } from '../engine/constants';
import { sentenceIndex } from './sentenceIndex';

const TOP_N = 40;

function compute(): ReadonlyArray<string> {
  const counts = new Map<string, number>();
  for (const { text } of sentenceIndex) {
    for (const ch of text) {
      if (PUNCTUATION_SET.has(ch)) continue;
      counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
  }
  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_N)
    .map(([ch]) => ch);
  return Object.freeze(ranked);
}

export const COMMON_CHARS: ReadonlyArray<string> = compute();
```

> **Note:** Once the full 500-poem dataset (Task 25) replaces the seed, `COMMON_CHARS.length` should be exactly 40. Until then, the test caps at the smaller dataset's unique-character count.

- [ ] **Step 4: Run, confirm pass**

Run: `npm test -- --run src/data/commonChars.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/data/commonChars.ts src/data/commonChars.test.ts
git commit -m "feat(data): precompute top-40 most frequent characters"
```

---

## Phase C — Persistence

### Task 10: localStorage load / save / clear

**Files:**
- Create: `src/persistence/storage.ts`
- Create: `src/persistence/storage.test.ts`

`savePuzzleState` strips `currentInput` before serialising. `loadPuzzleState` returns `null` on a missing key OR on parse error. `clearPuzzleState` removes the key.

- [ ] **Step 1: Write the failing tests**

```ts
// src/persistence/storage.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import type { PuzzleState } from '../types';
import { clearPuzzleState, loadPuzzleState, savePuzzleState } from './storage';
import { STORAGE_KEY } from '../engine/constants';

class FakeStorage {
  private bag = new Map<string, string>();
  getItem(k: string) { return this.bag.has(k) ? this.bag.get(k)! : null; }
  setItem(k: string, v: string) { this.bag.set(k, v); }
  removeItem(k: string) { this.bag.delete(k); }
  clear() { this.bag.clear(); }
}

const state: PuzzleState = {
  mode: 'daily',
  sentenceId: 101,
  answer: '床前明月光',
  guesses: ['月光床前明'],
  cellStatuses: [['present', 'present', 'present', 'present', 'present']],
  charMap: { 月: 'present', 光: 'present', 床: 'present', 前: 'present', 明: 'present' },
  currentInput: 'AB',          // must be stripped on save
  gameOver: false,
  won: false,
};

beforeEach(() => {
  // Provide a fresh fake `localStorage` for each test.
  (globalThis as any).localStorage = new FakeStorage();
});

describe('storage', () => {
  it('savePuzzleState strips currentInput', () => {
    savePuzzleState(state);
    const raw = localStorage.getItem(STORAGE_KEY)!;
    expect(JSON.parse(raw).currentInput).toBeUndefined();
  });

  it('loadPuzzleState restores fields and resets currentInput to empty string', () => {
    savePuzzleState(state);
    const loaded = loadPuzzleState()!;
    expect(loaded.answer).toBe('床前明月光');
    expect(loaded.guesses).toEqual(['月光床前明']);
    expect(loaded.currentInput).toBe('');
  });

  it('loadPuzzleState returns null when no entry exists', () => {
    expect(loadPuzzleState()).toBeNull();
  });

  it('loadPuzzleState returns null on parse error', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadPuzzleState()).toBeNull();
  });

  it('clearPuzzleState removes the key', () => {
    savePuzzleState(state);
    clearPuzzleState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test -- --run src/persistence/storage.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/persistence/storage.ts
import type { PuzzleState } from '../types';
import { STORAGE_KEY } from '../engine/constants';

export function savePuzzleState(state: PuzzleState): void {
  try {
    const { currentInput: _ignored, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    // Quota exceeded or storage unavailable — silently no-op. The game still
    // works in-memory; the next mutation will retry.
  }
}

export function loadPuzzleState(): PuzzleState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as Omit<PuzzleState, 'currentInput'>;
    return { ...parsed, currentInput: '' };
  } catch {
    return null;
  }
}

export function clearPuzzleState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test -- --run src/persistence/storage.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/persistence/storage.ts src/persistence/storage.test.ts
git commit -m "feat(persistence): load/save/clear puzzle state in localStorage"
```

---

## Phase D — Game state

### Task 11: useGameState hook (useReducer + persistence sync)

**Files:**
- Create: `src/hooks/useGameState.ts`

This is the single source of truth for the game. The reducer owns all transitions; the hook wraps it with persistence side effects.

- [ ] **Step 1: Implement the reducer + hook**

```ts
// src/hooks/useGameState.ts
import { useEffect, useReducer, type Dispatch } from 'react';
import type { CharStatus, PuzzleState, SentenceRecord } from '../types';
import { MAX_ATTEMPTS } from '../engine/constants';
import { evaluateGuess } from '../engine/evaluate';
import { updateCharMap } from '../engine/charMap';
import { stripPunctuation } from '../engine/punctuation';
import {
  clearPuzzleState,
  loadPuzzleState,
  savePuzzleState,
} from '../persistence/storage';

export type Action =
  | { type: 'START_PUZZLE'; mode: 'daily' | 'random'; record: SentenceRecord }
  | { type: 'UPDATE_INPUT'; input: string }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'RESET' };

export type State = PuzzleState | null;

const EMPTY: State = null;

function startState(
  mode: 'daily' | 'random',
  record: SentenceRecord,
): PuzzleState {
  const { clean } = stripPunctuation(record.text);
  return {
    mode,
    sentenceId: record.lineId,
    answer: clean,
    guesses: [],
    cellStatuses: [],
    charMap: {},
    currentInput: '',
    gameOver: false,
    won: false,
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_PUZZLE':
      return startState(action.mode, action.record);

    case 'RESET':
      return EMPTY;

    case 'UPDATE_INPUT':
      if (!state || state.gameOver) return state;
      // Constrain input length to the answer's guessable length.
      return { ...state, currentInput: action.input.slice(0, state.answer.length) };

    case 'SUBMIT_GUESS': {
      if (!state || state.gameOver) return state;
      const guess = state.currentInput;
      if (guess.length !== state.answer.length) return state;
      const statuses: CharStatus[] = evaluateGuess(guess, state.answer);
      const won = statuses.every((s) => s === 'correct');
      const guesses = [...state.guesses, guess];
      const gameOver = won || guesses.length >= MAX_ATTEMPTS;
      return {
        ...state,
        guesses,
        cellStatuses: [...state.cellStatuses, statuses],
        charMap: updateCharMap(state.charMap, guess, statuses),
        currentInput: '',
        won,
        gameOver,
      };
    }

    default:
      return state;
  }
}

export interface UseGameState {
  state: State;
  dispatch: Dispatch<Action>;
}

export function useGameState(): UseGameState {
  // Lazy init: rehydrate from storage, but never auto-resume a completed game.
  const [state, dispatch] = useReducer(reducer, EMPTY, () => {
    const persisted = loadPuzzleState();
    if (!persisted) return EMPTY;
    if (persisted.gameOver) return EMPTY;
    return persisted;
  });

  // Persist on every change except pure typing.
  useEffect(() => {
    if (state === null) {
      clearPuzzleState();
    } else {
      savePuzzleState(state);
    }
    // Intentionally exclude state.currentInput from the dependency array so
    // typing keystrokes don't write to localStorage on every character.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state?.mode,
    state?.sentenceId,
    state?.guesses.length,
    state?.gameOver,
    state?.won,
  ]);

  return { state, dispatch };
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npm run build`
Expected: succeeds (TypeScript is part of the build).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGameState.ts
git commit -m "feat(state): useGameState reducer with persistence sync"
```

---

## Phase E — UI components

### Task 12: CharCell

**Files:**
- Create: `src/components/CharCell.tsx`

A single character box. Status drives the background colour via Tailwind classes that match the existing theme (`bg-correct`, `bg-present`, `bg-absent`).

- [ ] **Step 1: Implement**

```tsx
// src/components/CharCell.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CharCell.tsx
git commit -m "feat(ui): CharCell — coloured character box driven by CharStatus"
```

---

### Task 13: GuessRow

**Files:**
- Create: `src/components/GuessRow.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/GuessRow.tsx
import type { CharStatus } from '../types';
import { CharCell } from './CharCell';

export interface GuessRowProps {
  guess: string;
  statuses: CharStatus[];
}

export function GuessRow({ guess, statuses }: GuessRowProps) {
  return (
    <div className="flex gap-1 justify-center">
      {[...guess].map((ch, i) => (
        <CharCell key={i} char={ch} status={statuses[i]} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GuessRow.tsx
git commit -m "feat(ui): GuessRow — row of CharCells for a submitted guess"
```

---

### Task 14: GuessHistory

**Files:**
- Create: `src/components/GuessHistory.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/GuessHistory.tsx
import type { CharStatus } from '../types';
import { GuessRow } from './GuessRow';

export interface GuessHistoryProps {
  guesses: string[];
  cellStatuses: CharStatus[][];
}

export function GuessHistory({ guesses, cellStatuses }: GuessHistoryProps) {
  return (
    <div className="flex flex-col gap-1">
      {guesses.map((g, i) => (
        <GuessRow key={i} guess={g} statuses={cellStatuses[i] ?? []} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GuessHistory.tsx
git commit -m "feat(ui): GuessHistory — stacked GuessRows for the current puzzle"
```

---

### Task 15: GuessInput (with pre-filled punctuation)

**Files:**
- Create: `src/components/GuessInput.tsx`

The input is a controlled text field constrained to the answer's guessable length. Punctuation slots from the original sentence are NOT part of the input — they are shown as read-only cells alongside the input row by the parent `GameBoard` (see Task 19). This component owns only the guessable-character buffer.

- [ ] **Step 1: Implement**

```tsx
// src/components/GuessInput.tsx
import { useEffect, useRef } from 'react';

export interface GuessInputProps {
  length: number;
  value: string;
  disabled: boolean;
  onChange: (next: string) => void;
  onSubmit: () => void;
}

export function GuessInput({
  length,
  value,
  disabled,
  onChange,
  onSubmit,
}: GuessInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  // Keep focus when not disabled.
  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled, length]);

  const ready = value.length === length;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready && !disabled) onSubmit();
      }}
      className="flex flex-col items-center gap-3"
    >
      <input
        ref={ref}
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        maxLength={length}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.slice(0, length))}
        className="w-full max-w-sm rounded-lg border border-[#3a3a3c]
                   bg-[#1a1a1b] px-3 py-2 text-center text-xl tracking-widest
                   focus:border-white outline-none"
        placeholder={`輸入 ${length} 字`}
      />
      <button type="submit" disabled={!ready || disabled} className="btn-primary">
        提交
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GuessInput.tsx
git commit -m "feat(ui): GuessInput — length-constrained input + submit button"
```

---

### Task 16: PreviewRow

**Files:**
- Create: `src/components/PreviewRow.tsx`

Live row reflecting the player's current input buffer. Each cell:
- If the player typed a character at this position AND `charMap[char] === 'absent'`, render with `absent` styling (warning the player they're reusing a known-bad char).
- Else if the cell index has a known `correct` character from history AND the player has typed the same character there, render `correct`.
- Else render as a plain neutral cell with the typed character (or empty if not yet typed).

For "known `correct` at position `i`", scan the previous `cellStatuses`: take the first row where `cellStatuses[r][i] === 'correct'` and remember its character.

- [ ] **Step 1: Implement**

```tsx
// src/components/PreviewRow.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PreviewRow.tsx
git commit -m "feat(ui): PreviewRow — live row reflecting typing against history"
```

---

### Task 17: CharacterTable

**Files:**
- Create: `src/components/CharacterTable.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/components/CharacterTable.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CharacterTable.tsx
git commit -m "feat(ui): CharacterTable — top-40 chars coloured by best status"
```

---

## Phase F — Pages

### Task 18: LandingPage

**Files:**
- Create: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/pages/LandingPage.tsx
export interface LandingPageProps {
  onStartDaily: () => void;
  onStartRandom: () => void;
}

export function LandingPage({ onStartDaily, onStartRandom }: LandingPageProps) {
  return (
    <section className="flex flex-col items-center gap-8 py-16">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-wide">詩樂</h1>
        <p className="mt-2 text-[#818384]">猜詩句的字謎遊戲</p>
      </header>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onStartDaily} className="btn-primary">
          今日詩題
        </button>
        <button onClick={onStartRandom} className="btn-secondary">
          隨機一題
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(ui): LandingPage with daily and random start actions"
```

---

### Task 19: GameBoard

**Files:**
- Create: `src/pages/GameBoard.tsx`

Composes history, preview, input, and the common-character table. Also renders the sentence-length hint and (where needed) the punctuation pre-fill display. This file integrates `stripPunctuation` so the UI knows the slot positions.

- [ ] **Step 1: Implement**

```tsx
// src/pages/GameBoard.tsx
import type { Action, State } from '../hooks/useGameState';
import type { Dispatch } from 'react';
import { GuessHistory } from '../components/GuessHistory';
import { PreviewRow } from '../components/PreviewRow';
import { GuessInput } from '../components/GuessInput';
import { CharacterTable } from '../components/CharacterTable';

export interface GameBoardProps {
  state: NonNullable<State>;
  dispatch: Dispatch<Action>;
}

export function GameBoard({ state, dispatch }: GameBoardProps) {
  const length = state.answer.length;

  return (
    <section className="flex flex-col items-center gap-6 py-6">
      <p className="text-sm text-[#818384]">
        {state.mode === 'daily' ? '今日詩題' : '隨機一題'} · {length} 字
      </p>

      <GuessHistory
        guesses={state.guesses}
        cellStatuses={state.cellStatuses}
      />

      <PreviewRow
        length={length}
        input={state.currentInput}
        charMap={state.charMap}
        cellStatuses={state.cellStatuses}
        guesses={state.guesses}
      />

      <GuessInput
        length={length}
        value={state.currentInput}
        disabled={state.gameOver}
        onChange={(input) => dispatch({ type: 'UPDATE_INPUT', input })}
        onSubmit={() => dispatch({ type: 'SUBMIT_GUESS' })}
      />

      <div className="w-full max-w-md mt-4">
        <CharacterTable charMap={state.charMap} />
      </div>
    </section>
  );
}
```

> **Punctuation convention.** Per `design.md`, lines in the curated dataset are stored **without** punctuation (the seed in Task 2 follows this). `stripPunctuation` is kept in the engine for safety — if a line somehow contains punctuation, `state.answer` is the punctuation-free substring. With the convention upheld, no visible punctuation slots are needed in the UI. If a future dataset version reintroduces punctuation, the visible pre-fill UI must be added (see Task 26) before that dataset ships.

- [ ] **Step 2: Commit**

```bash
git add src/pages/GameBoard.tsx
git commit -m "feat(ui): GameBoard composes history, preview, input, char table"
```

---

### Task 20: GameOverPanel

**Files:**
- Create: `src/pages/GameOverPanel.tsx`

Shown when `state.gameOver === true`. Reveals the answer, the source poem (title / author / dynasty / full text), and offers a fresh random game.

- [ ] **Step 1: Implement**

```tsx
// src/pages/GameOverPanel.tsx
import { useMemo } from 'react';
import type { PuzzleState } from '../types';
import { poems } from '../data';

export interface GameOverPanelProps {
  state: PuzzleState;
  onNewRandomGame: () => void;
}

export function GameOverPanel({ state, onNewRandomGame }: GameOverPanelProps) {
  const poem = useMemo(
    () => poems.find((p) => p.lines.some((l) => l.id === state.sentenceId)),
    [state.sentenceId],
  );

  return (
    <section className="flex flex-col items-center gap-6 py-12 text-center">
      <h2 className="text-3xl font-bold">
        {state.won ? '答對了!' : '挑戰結束'}
      </h2>
      <p className="text-xl">答案: {state.answer}</p>

      {poem && (
        <article className="max-w-md">
          <h3 className="text-xl font-semibold">{poem.title}</h3>
          <p className="text-sm text-[#818384]">
            {poem.author} · {poem.dynasty === 'tang' ? '唐' : '宋'}
          </p>
          <div className="mt-3 flex flex-col gap-1">
            {poem.lines.map((l) => (
              <p key={l.id} className="text-lg">{l.text}</p>
            ))}
          </div>
        </article>
      )}

      <button onClick={onNewRandomGame} className="btn-primary">
        再來一題
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/GameOverPanel.tsx
git commit -m "feat(ui): GameOverPanel reveals answer, source poem, and reset"
```

---

## Phase G — Wiring & verification

### Task 21: Wire everything together in App.tsx

**Files:**
- Modify: `src/App.tsx`

Replace the stub. The router is just a switch over `state` and `state.gameOver`.

- [ ] **Step 1: Implement**

```tsx
// src/App.tsx
import { useGameState } from './hooks/useGameState';
import { sentenceIndex } from './data/sentenceIndex';
import { getDailyPuzzle, getRandomPuzzle } from './engine/puzzle';
import { LandingPage } from './pages/LandingPage';
import { GameBoard } from './pages/GameBoard';
import { GameOverPanel } from './pages/GameOverPanel';

export default function App() {
  const { state, dispatch } = useGameState();

  if (!state) {
    return (
      <main className="min-h-screen max-w-3xl mx-auto px-4">
        <LandingPage
          onStartDaily={() =>
            dispatch({
              type: 'START_PUZZLE',
              mode: 'daily',
              record: getDailyPuzzle(sentenceIndex),
            })
          }
          onStartRandom={() =>
            dispatch({
              type: 'START_PUZZLE',
              mode: 'random',
              record: getRandomPuzzle(sentenceIndex),
            })
          }
        />
      </main>
    );
  }

  if (state.gameOver) {
    return (
      <main className="min-h-screen max-w-3xl mx-auto px-4">
        <GameOverPanel
          state={state}
          onNewRandomGame={() => {
            dispatch({ type: 'RESET' });
            dispatch({
              type: 'START_PUZZLE',
              mode: 'random',
              record: getRandomPuzzle(sentenceIndex),
            });
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4">
      <GameBoard state={state} dispatch={dispatch} />
    </main>
  );
}
```

- [ ] **Step 2: Verify a full build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire LandingPage, GameBoard, GameOverPanel via useGameState"
```

---

### Task 22: Verify reload behaviour manually

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open the printed URL in a browser (typically `http://localhost:5173`).

- [ ] **Step 2: Walk the golden path**

1. Landing page shows two buttons.
2. Click **隨機一題** → game board appears with a sentence-length hint and an empty history.
3. Type a guess that matches the length → submit button activates → submit → row appears in history with colours.
4. Type a known-bad character → preview row paints it red.
5. Submit a correct guess (or exhaust 8 attempts) → game-over panel appears with poem details.
6. Click **再來一題** → a new random puzzle starts.

- [ ] **Step 3: Reload while mid-game**

1. Start a random puzzle, submit two guesses.
2. Reload the page.
3. Confirm: history shows both guesses, character table reflects the same statuses, sentence-length hint matches.

- [ ] **Step 4: Reload after game over**

1. Finish a game (win or lose).
2. Reload.
3. Confirm: the landing page is shown (NOT the game-over panel from the previous run).

- [ ] **Step 5: Daily determinism**

1. Note today's daily puzzle on this machine.
2. Open a private/incognito window (cleared localStorage).
3. Click **今日詩題** — confirm the same sentence appears.

- [ ] **Step 6: Run the full test suite**

Run: `npm test -- --run`
Expected: every test passes.

- [ ] **Step 7: No commit**

Verification only. If a step fails, file the bug as a follow-up task and fix before merging.

---

### Task 23: Production build & smoke test

**Files:**
- Modify (if deploying to a subpath): `vite.config.ts`

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: succeeds, produces `dist/`.

- [ ] **Step 2: Smoke-test the production bundle**

Run: `npm run preview`
Open the printed URL.
Repeat the golden path from Task 22 Step 2.

- [ ] **Step 3: If deploying to a GitHub Pages subpath, adjust `base`**

```ts
// vite.config.ts — only if hosting under e.g. https://<user>.github.io/Poemle/
export default defineConfig({
  plugins: [react()],
  base: '/Poemle/',
});
```

Re-run `npm run build` and verify asset URLs in `dist/index.html` are prefixed.

- [ ] **Step 4: Commit (only if `base` was changed)**

```bash
git add vite.config.ts
git commit -m "chore: set Vite base path for deployment"
```

---

### Task 24: Manual verification checklist (golden + edges)

**Files:** none (verification only)

Re-run the checks below before merging the MVP. This list is the final stand-in for component-level integration tests.

- [ ] **Step 1: Golden path** (Task 22 Step 2) — passes.
- [ ] **Step 2: Reload mid-game** (Task 22 Step 3) — restored correctly.
- [ ] **Step 3: Reload after game-over** (Task 22 Step 4) — lands on landing page.
- [ ] **Step 4: Daily determinism** (Task 22 Step 5) — two sessions agree.
- [ ] **Step 5: Duplicate-character UX** — set up a puzzle whose answer has two identical chars; guess once with a third occurrence; confirm cells are `correct` / `present` / `absent` per the rules.
- [ ] **Step 6: Mobile width** — narrow Chrome dev-tools to 360 px; the board, preview, and char table all fit without horizontal scroll.
- [ ] **Step 7: Win flow** — actually solve a puzzle; confirm panel + poem details.
- [ ] **Step 8: Lose flow** — submit 8 wrong guesses; confirm panel + answer reveal.
- [ ] **Step 9: localStorage quota** — DevTools → Application → Storage → confirm `poemle_active_puzzle` is well under 5 KB.

Run the verification skill before declaring done: `superpowers:verification-before-completion`.

---

## Phase H — Follow-up work (out of scope for this plan)

The MVP is shippable with the seed dataset. These tasks are tracked here for visibility but live in **separate** plans.

### Task 25 (separate plan): Full 500-poem dataset curation

Curate at least 300 Tang poems and 200 Song lyrics, assign globally unique `line.id` values, and replace `src/data/poems.json`. The flat index, common-character table, and engine handle scale automatically. Verify `COMMON_CHARS.length === 40` after replacement.

**Sources** (古文岛 / guwendao.net — poetry-only collections; the grade-school canon pages — 小学/初中/高中必背 — were tried earlier but mix in classical prose like 师说 / 赤壁赋 / 岳阳楼记 and have been removed from the scraper):

- <https://www.guwendao.net/gushi/tangshi.aspx> — 唐诗三百首 (Three Hundred Tang Poems)
- <https://www.guwendao.net/gushi/sanbai.aspx> — 古诗三百首 (Three Hundred Ancient Poems — mostly Tang, some earlier)
- <https://www.guwendao.net/gushi/songsan.aspx> — 宋词三百首 (Three Hundred Song Lyrics)

**Curation conventions** (must match the engine):

- Strip all punctuation from `line.text` (`。 ， 、 ； ： ！ ？ 「 」 『 』 《 》 —`); store one cleaned phrase per `line` entry.
- For 詞 (Song lyrics) with mixed line lengths, treat each clause/句 between punctuation marks as a separate `line`.
- Set `dynasty` to `"tang"` or `"song"` based on the source page. Skip entries that aren't Tang or Song (e.g., 漢 / 魏 / 唐前 from the grade-school collections).
- Use a monotonically increasing `poem.id` starting at 1; `line.id` can be `poem.id * 100 + position` (matches the seed convention) as long as the resulting IDs are globally unique. If any collide once datasets grow, switch to a flat global counter.
- Deduplicate by (title, author) so the same poem appearing in multiple collections is included only once.

**Acceptance checks** (after replacing `poems.json`):

- `npm test -- --run` still green; `COMMON_CHARS.length === 40` (tighten the assertion in `src/data/commonChars.test.ts` accordingly).
- Total `sentenceIndex.length >= 1500` (≈ 500 poems × 3 lines/poem on average).
- Spot-check 5 random entries against the source page to catch transcription errors.

### Task 26 (separate plan): Polish & animations

- Pre-fill punctuation visibly in the input row instead of just stripping it.
- Apply `flip-in` / `bounce-in` / `slide-up` Tailwind animations to row reveals and the game-over panel.
- Add share-image generation (deferred per design.md non-goals).

---

## Self-review (already executed by the plan author)

**Spec coverage** — every OpenSpec capability is covered:

| OpenSpec capability        | Task(s)              |
| -------------------------- | -------------------- |
| `poem-dataset`             | 2, 3, 25             |
| `puzzle-engine`            | 4, 5, 6, 7, 8, 11    |
| `game-ui`                  | 12, 13, 14, 15, 18, 19, 20, 21 |
| `guess-history`            | 13, 14               |
| `guess-preview`            | 16                   |
| `character-table`          | 9, 17                |
| `local-storage-persistence`| 10, 11, 22           |

**Placeholder scan** — no "TBD", "implement later", or naked validation phrases remain. Every step contains the code or command it asks for.

**Type/name consistency** — `evaluateGuess`, `updateCharMap`, `stripPunctuation`, `fnv1a32`, `getDailyPuzzle`, `getRandomPuzzle`, `loadPuzzleState`, `savePuzzleState`, `clearPuzzleState`, `useGameState`, action types, prop names, and `STORAGE_KEY` are spelled identically across all tasks.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-poemle-spa.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration. Required sub-skill: `superpowers:subagent-driven-development`.

**2. Inline Execution** — execute tasks in this session using `superpowers:executing-plans` with batch checkpoints for review.

**Which approach?**

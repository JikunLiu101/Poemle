# Poemle — Working Notes for Claude

Poemle is a static Single Page Application: a Wordle-style guessing game where
the answer is a sentence from a classical Chinese poem (Tang poems and Song
lyrics). All data is bundled at build time; there is no backend and no login.

## Tech stack

- **Vite** (build & dev server) + **React 18** + **TypeScript** (strict).
- **Tailwind CSS** for styling. Theme tokens live in `tailwind.config.js`
  (`correct` / `present` / `absent` / `cell`) and `src/index.css`
  (CSS variables + base button/cell utility classes + animations).
- **Vitest** for unit tests (engine and persistence). UI is verified manually
  with `npm run dev`.
- **No backend, no fetch.** The poem dataset is an imported JSON module.
- **`localStorage`** is the only persistence layer.

## Commands

| Command          | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `npm run dev`    | Vite dev server with HMR                          |
| `npm run build`  | `tsc -b && vite build` — produces static `dist/`  |
| `npm run preview`| Serve the built `dist/` for smoke testing         |
| `npm test`       | Vitest in watch mode                              |
| `npm test -- --run` | Vitest one-shot (use in CI / verification)     |

## Source layout (target)

```
src/
  types/index.ts          # Domain types: Poem, SentenceRecord, CharStatus, PuzzleState
  data/
    poems.json            # Bundled dataset (500+ poems)
    index.ts              # Typed import of poems.json
    sentenceIndex.ts      # Flat { poemId, lineId, text } index, frozen
    commonChars.ts        # Top-40 frequency-ranked characters
  engine/
    hash.ts               # FNV-1a 32-bit for daily seed
    punctuation.ts        # Strip + slot-map classical punctuation
    evaluate.ts           # Two-pass guess evaluation
    charMap.ts            # Best-known status per character (never downgrade)
    puzzle.ts             # getDailyPuzzle / getRandomPuzzle
  persistence/
    storage.ts            # load / save / clear puzzle state
  hooks/
    useGameState.ts       # useReducer over PuzzleState + storage sync
  components/             # CharCell, GuessRow, GuessHistory, PreviewRow,
                          # GuessInput, CharacterTable
  pages/                  # LandingPage, GameBoard, GameOverPanel
  App.tsx                 # Top-level router/state container
  main.tsx                # React entry point
```

Tests live next to the unit under test as `<file>.test.ts`.

## Core design decisions

- **Daily seed**: FNV-1a 32-bit hash of `YYYYMMDD` (local time), mod
  `sentenceIndex.length`. Deterministic — same date = same puzzle for all
  players, no server required.
- **Guess evaluation**: two-pass with duplicate handling.
  1. Mark exact matches `correct`; remove from the answer's character pool.
  2. For remaining positions, mark `present` if the character is still in the
     pool (consuming one occurrence) else `absent`.
- **Status promotion only**: the per-character status map (`charMap`) never
  downgrades. `correct` > `present` > `absent` > `unknown`.
- **Punctuation slots**: classical punctuation (`。 ， ！ ？ 、 ； ：`) in the
  answer is pre-filled and read-only in the guess input; not counted in the
  guessable length and not evaluated.
- **Max attempts**: 8 (configurable constant).
- **Persistence key**: a single `poemle_active_puzzle` localStorage key.
  `currentInput` (the live typing buffer) is excluded from the serialised state.
- **On completed game (`gameOver: true`)**: do NOT auto-resume; route to
  landing or game-over screen instead.

## Conventions

- TypeScript strict; no `any` in committed code. Engine modules export pure
  functions plus their types — no global state.
- Tailwind utilities preferred over custom CSS; reach for `src/index.css`
  layers only for repeated patterns (e.g. `cell-base`, `btn-primary`).
- React: a single `useReducer` owns `PuzzleState`. Side effects (localStorage)
  happen in a `useEffect` keyed off the state object.
- Tests focus on **pure functions** (engine, persistence). For UI, prefer
  manual verification over heavy RTL setup; add component tests only when a
  behaviour is hard to verify by eye.
- Commits are small and focused. Use conventional-commit-style prefixes
  (`feat:`, `fix:`, `test:`, `chore:`, `docs:`) when convenient.

## Planning & execution

This repo uses the **superpowers** plugin workflow. See
[`docs/superpowers/README.md`](docs/superpowers/README.md). The active MVP
plan is
[`docs/superpowers/plans/2026-05-28-poemle-spa.md`](docs/superpowers/plans/2026-05-28-poemle-spa.md).

Before non-trivial work:

1. `superpowers:brainstorming` to lock intent.
2. `superpowers:writing-plans` to capture tasks.
3. `superpowers:subagent-driven-development` (or `executing-plans`) to ship.
4. `superpowers:verification-before-completion` before declaring done.

## Git

Commits in this repo are authored as **Liu Jikun** (`1015482278@qq.com`). The
local git config is already set correctly, so a normal `git commit` produces
the right author. Do **not** override the author to the macOS account name
(`lawrenceliu`) — that's the OS user, not the project author.

# Superpowers Docs

Home for Poemle's superpowers-style planning and design docs.

## Layout

- `plans/` — implementation plans authored with `superpowers:writing-plans`.
  Filename convention: `YYYY-MM-DD-<feature-name>.md`.

## How to use

1. **Before non-trivial work**: run `superpowers:brainstorming` to lock down intent.
2. **Before touching code**: run `superpowers:writing-plans` to produce a plan
   under `plans/` with bite-sized, testable tasks.
3. **To execute a plan**: dispatch via `superpowers:subagent-driven-development`
   (preferred) or `superpowers:executing-plans` for inline batched execution.
4. **Before claiming completion**: run `superpowers:verification-before-completion`
   to confirm tests, build, and behaviour.

## Current plans

- [2026-05-28-poemle-spa.md](plans/2026-05-28-poemle-spa.md) — initial MVP build:
  poem dataset, puzzle engine, persistence, UI, and full game flow.

## History

This project was previously specified with [OpenSpec](https://github.com/Fission-AI/OpenSpec).
The `openspec/changes/poemle-spa/` proposal, design, and per-capability specs
have been folded into the plan above and removed from the repo. The original
seven OpenSpec capabilities (`poem-dataset`, `puzzle-engine`, `game-ui`,
`guess-history`, `guess-preview`, `character-table`, `local-storage-persistence`)
each map to one or more tasks in the MVP plan.

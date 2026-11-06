# NeuroMeet — shared agent workflow

This file is the **single source of truth** for how AI agents work on this repo.
It is shared by every agent (OpenCode, Antigravity/`agy`, any future one).
Each agent's own global instructions point here; nothing is copied, so versions never drift.

## The 7 lifecycle layers

Every task belongs to exactly one layer. State which one before starting.

| Layer | What it is | Who does it |
|---|---|---|
| **DEFINE** | What problem, for whom, what "done" means | the orchestrator, inline |
| **PLAN** | How, in what order, what blocks what | the orchestrator, inline |
| **BUILD** | Write the code | a worker (bulk/mechanical work delegates) |
| **VERIFY** | Prove it works — tests, gates, load | a worker |
| **REVIEW** | Judge what was built — guards, security, docs | a worker |
| **SHIP** | Pipelines, release | the orchestrator, inline |
| **META** | Research, skills, handoff, docs | a worker |

Judgment layers (DEFINE/PLAN/SHIP) are never delegated; execution layers (BUILD/VERIFY/REVIEW/META) are.

## Brief contract (how a task is handed over)

A task handed to a worker is a self-contained brief containing all of:

- **Goal** — what "done" looks like
- **Current state** — relevant files and their present shape
- **What to change** — named explicitly
- **What NOT to touch** — named explicitly
- **Gates** — the project's real commands (below)
- **Report contract** — the shape the answer must come back in

One task per brief. The worker never commits.

## Report contract

A worker returns, in this order:

1. Files changed (paths)
2. Gate commands run, with exit codes and pass/fail counts
3. Anything skipped or uncertain
4. Design decisions made that the brief did not ask for (surface, don't absorb)

## Guard rules

- On non-trivial **production code**: load `clean-code-guard` and run its pass before presenting.
- On **test code**: use `test-guard` instead.
- Lean code always: delete-first (need it? reuse? stdlib? platform? installed dep? one line? minimum), **no inline or trailing comments** (titled `// --- Section ---` dividers only where the file already uses them), functions ≤20 lines, no speculative abstractions, no new dependencies.
- On React/Next.js UI component or styling work (TSX, CSS, Tailwind, `globals.css`, Shadcn/CVA): additionally run the `enterprise-styling-architecture` pass — design tokens over inline values, CVA variants over class dumps, parent gap over child margins, ghost-class removal.
- Skip the guard for trivial edits, docs/prose, and config-only changes.

## Commit boundary

**Workers never commit.** The orchestrator (or the human) reviews the diff, re-runs the gates, and commits. If correct completion needs going beyond the brief, ask — do not expand the mandate.

## Verification

Never trust a worker's self-report. The reviewer re-runs the gates and reads the diff itself.

## Gates

- Backend: `bun run test` (Jest), `bun run build` (nest build -b swc)
- Use the gate appropriate to the layer and the files touched.

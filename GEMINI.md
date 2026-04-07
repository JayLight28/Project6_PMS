# Project6_PMS -- Gemini Agent Reference (v1.2.0)

> [!IMPORTANT]
> This file is Gemini's primary reference. Reading this alone covers 80% of tasks.

## 1. HARD RULES (Never Violate)

> [!CAUTION]
> ### Environment
> - **Code on Mac**, **Run on Windows** (via script/terminal).
>
> ### Code
> - **No Inline Business Logic**: Keep logic in `server.js` or `sync_util.js`, NOT in components.

### Communication
- Korean for conversation, English for code/docs
- Git = Commit + Push (push immediately after commit)
- Minimal diff -- targeted snippets, not full file overwrites

### Output Behavior
- No sycophantic openers -- answer is always line 1
- No hollow closings
- No prompt restatement -- execute immediately
- ASCII-only -- no em dashes, smart quotes
- No "As an AI..." framing
- No unsolicited suggestions -- exact scope only
- No unnecessary disclaimers
- Simplest working solution
- Uncertain facts -> say "I don't know"
- User correction becomes session ground truth
- Never read the same file twice in one session
- Never touch code outside explicit scope

## 2. PROJECT OVERVIEW
- **Mother (HQ)**: Global fleet management, dashboard mimicry, template distribution.
- **Child (Vessel)**: Onboard operations, local data management, synchronization.
- **Goal**: Dynamic tree-based category management for all maritime compliance.
- **Stack**: Vite + React + TypeScript, Express, SQLite.

## 3. KEY FILES & LINE MAP
- **Mother FE**: `mother/src/App.tsx`
- **Mother BE**: `mother/server.js`
- **Child FE**: `child/src/App.tsx`
- **Child BE**: `child/server.js`
- **Shared**: `shared/sync_util.js`, `shared/schema.sql`
- Full line map → `docs_canonical/REPO_MAP.md`

## 4. CODING PATTERNS
- **UI**: Glassmorphism using Vanilla CSS Variables. No one-off inline styles.
- **Logic Location**: `server.js` / `sync_util.js` for heavy lifting. Keep React neat.

## 5. DATA FLOW
- Both apps deploy and sync locally (Mother: 3001, Child: 3002).
- Manual push mechanics for JSON sync files.

## 6. SESSION COMMANDS

> [!IMPORTANT]
> ### /dock -- End of session
> Execute in order:
> 1. Version bump: patch (0.0.n), minor (0.n.0), or major (n.0.0). Carry rule at 10.
> 2. Version sync: Propagate new version to README.md, CLAUDE.md, GEMINI.md headers.
> 3. REPO_MAP.md update: re-scan real line numbers for all core entry files (never copy from memory).
> 4. Conditional canonical updates:
>    - ARCHITECTURE.md -> only if new view mode, API route, or data flow added
>    - STYLEGUIDE.md -> only if new convention introduced
>    - WORKFLOWS.md -> only if build/deploy process changed
> 5. README.md: append one-line change summary.
> 6. git commit + push: `vX.X.X -- [summary]`.

> [!IMPORTANT]
> ### /survey -- Full code inspection
> 1. Type check: `npx tsc --noEmit` or equivalent. Report all errors.
> 2. Glitch & bug scan: unhandled promise rejections, missing null checks, logic bugs, race conditions.
> 3. Feature/function sync: every frontend action has a matching backend handler; no orphaned endpoints.
> 4. UI consistency: component patterns match STYLEGUIDE.md; no one-off inline styles.
> 5. Integrity check: API response shapes match TypeScript types; REPO_MAP routes exist in real code.
> 6. Hard Rule violations: scan for any Section 1 breach.
> 7. Report: Critical / Warning / Info tiers.

## 7. DEEP DIVE (only when needed)
| Doc | Content | When |
|-----|---------|------|
| `docs_canonical/REPO_MAP.md` | Full line map | Finding a function |
| `docs_canonical/AGENT_QUICKREF.md` | Dev quick rules | Refactoring flow |
| `docs_canonical/ARCHITECTURE.md` | Data flow | Adding a new module |
| `docs_canonical/STYLEGUIDE.md` | UI patterns | Styling work |
| `docs_canonical/WORKFLOWS.md` | Dev/Ops flow | Build/Deploy |

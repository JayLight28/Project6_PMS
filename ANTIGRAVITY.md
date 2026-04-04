# ANTIGRAVITY.md — Project6_PMS (v1.0.2)
> This file is Antigravity's primary reference. Reading this alone covers 80% of tasks.

> [!IMPORTANT]
> Read this first. Jump directly to line numbers. Do not read full files.

## 1. HARD RULES (Never Violate)

### Environment
- **Code on Mac**, **Run on Windows** (via script/terminal).

### Code
- **No Inline Business Logic**: Keep logic in `server.js` or `sync_util.js`, NOT in components.

### Communication
- Chat in **Korean**, Code/Comments/Docs in **English**.
- **Git Flow**: `commit` + `push` immediately after every logical change.
- **Minimal Diff**: Selective snippets only. No full file overwrites.

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

### `/dock` — End of session
1. **Version bump** (patch, minor, major) in code/README properties.
2. **Version sync** (README, CLAUDE, ANTIGRAVITY).
3. **REPO_MAP.md update** via `python3 scripts/update_index.py`.
4. **Conditional canonical updates** (ARCHITECTURE, STYLEGUIDE, WORKFLOWS).
5. **README.md** update with change summary.
6. **git commit + push**.

### `/survey` — Full code inspection
1. Type check
2. Glitch & bug scan
3. Feature / function sync
4. UI consistency audit
5. Integrity check
6. Hard Rule violations scan

## 7. DEEP DIVE (only when needed)
- docs_canonical/REPO_MAP.md | Full line map | Finding a function
- docs_canonical/AGENT_QUICKREF.md | Dev quick rules | Refactoring flow
- docs_canonical/ARCHITECTURE.md | Data flow | Adding a new module
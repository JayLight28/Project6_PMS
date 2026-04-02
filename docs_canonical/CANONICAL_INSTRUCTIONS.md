# CANONICAL_INSTRUCTIONS.md
# How to bootstrap and maintain docs_canonical/ for token-efficient agent coding

> **Universal standing order for any agent on any codebase.**
> Drop this file into any project's docs_canonical/ folder and follow every step in order.
> Never skip. Never trust existing doc content — always verify against real code.

---

## WHY THIS EXISTS

Agents waste tokens when canonical docs have stale line numbers or missing entries.
The result is agents reading entire files (1500+ lines) instead of jumping to the exact line.
The goal of docs_canonical/ is: **one targeted read per task, zero blind searches.**

---

## PHASE 0 — Identify this project's shape

Before any scans, answer these questions from the project root.
The answers determine what you scan in Phase 1.

```bash
# What language / framework is this?
ls package.json pyproject.toml go.mod Cargo.toml pom.xml 2>/dev/null

# What are the likely entry-point files? (adjust to whatever you find)
ls *.tsx *.ts src/main.* src/App.* main.py app.py server.py index.* 2>/dev/null

# What is the backend file? (Flask, FastAPI, Express, Django urls.py, etc.)
ls *.py src/server.* src/routes.* routes/ 2>/dev/null

# Directory structure overview
find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' \
       -not -path '*/dist/*' -not -path '*/__pycache__/*' | sort

# Current version
grep -m1 '"version"' package.json 2>/dev/null \
  || grep -m1 '^version' pyproject.toml 2>/dev/null \
  || grep -m3 "^## v\|^# v\|v[0-9]\+\.[0-9]" CHANGELOG.md README.md 2>/dev/null | head -3
```

Record:
- **FRONTEND_ENTRY** — the main state/routing file (e.g. `App.tsx`, `src/main.tsx`, `pages/_app.tsx`)
- **BACKEND_ENTRY** — the main server file (e.g. `app.py`, `server.ts`, `src/routes/index.ts`)
- **PROJECT_VERSION** — version string
- **STACK** — e.g. "React + TypeScript + Flask", "Next.js + FastAPI", "Express + MongoDB"

---

## PHASE 1 — Scan real code (ground truth)

Adapt these commands to the files you identified in Phase 0.
**Never invent a line number. Every number in docs_canonical/ must come from grep output.**

### Frontend entry file (substitute your FRONTEND_ENTRY)

```bash
# All top-level state handlers, fetchers, and key functions
# Adjust the pattern to match this project's naming style
grep -n "^\s*const \(fetch\|handle\|load\|on[A-Z]\|get[A-Z]\|set[A-Z]\)\w\+ \?=" $FRONTEND_ENTRY
grep -n "^export \(default \)\?function\|^const \w\+ = (" $FRONTEND_ENTRY | head -40

# useState and key state variables
grep -n "useState\|useReducer\|createStore\|defineStore" $FRONTEND_ENTRY | head -30

# Route/view mode values (React Router, Next.js, custom enum, etc.)
grep -n "route\|path\|viewMode\|PageName\|View\b" $FRONTEND_ENTRY | head -20

# Line count
wc -l $FRONTEND_ENTRY
```

### Backend entry file (substitute your BACKEND_ENTRY)

```bash
# All routes / endpoints
# Flask
grep -n "^@app\.route\|^@bp\.route\|^@router\." $BACKEND_ENTRY

# FastAPI
grep -n "@app\.\(get\|post\|put\|delete\|patch\)\|@router\." $BACKEND_ENTRY

# Express (TypeScript/JS)
grep -n "router\.\(get\|post\|put\|delete\|patch\)\|app\.\(get\|post\)" $BACKEND_ENTRY

# Django urls.py
grep -n "path(\|url(" $BACKEND_ENTRY

# All top-level functions / classes
grep -n "^def \|^class \|^async def \|^function \|^export function" $BACKEND_ENTRY | head -50

# Line count
wc -l $BACKEND_ENTRY
```

### Project-wide structure

```bash
# Existing directories that contain reusable code
ls components/ pages/ views/ hooks/ services/ utils/ helpers/ \
   lib/ api/ routes/ middleware/ store/ constants/ types/ 2>/dev/null

# Type definition files
find . -name "types.ts" -o -name "types.tsx" -o -name "*.d.ts" \
   -not -path '*/node_modules/*' 2>/dev/null | head -10
```

Save **all output**. Do not proceed until you have real line numbers.

---

## PHASE 2 — Write docs_canonical/REPO_MAP.md

Rebuild entirely from Phase 1 scan results. Use this structure:

```markdown
# REPOSITORY MAP — [PROJECT NAME] (v[PROJECT_VERSION])
Stack: [STACK]

## Directory Layout
[paste actual tree from Phase 0 find output — only real directories/files]

## [FRONTEND_ENTRY] Function Map (~[real wc -l] lines)
| Handler / Function | Line |
|--------------------|------|
[one row per grep result — NO omissions, NO invented lines]

## [BACKEND_ENTRY] Route Map (~[real wc -l] lines)
| Route / Method | Handler Function | Line |
|----------------|-----------------|------|
[one row per route — NO omissions, NO invented lines]

## Key Supporting Files
| File | Purpose |
|------|---------|
[list real files found in Phase 1 structure scan]

## Notes
- Token Efficiency: Check this map before opening any large file.
  Use Read tool with offset+limit to jump directly to needed lines.
- [any anomalies: legacy folders, duplicate files, generated code, etc.]
```

---

## PHASE 3 — Write docs_canonical/AGENT_QUICKREF.md

This is the file agents load on every session.
An agent must be able to start a targeted read without opening REPO_MAP.md.
Write it to be **self-sufficient**.

```markdown
# AGENT QUICK REFERENCE — [PROJECT NAME] (v[PROJECT_VERSION])

> Read this first. Jump directly to line numbers. Do not read full files.

## Project
[2–3 sentences: what this app does, who uses it, core data model]

## Stack
[STACK — exact versions if available]

## Dev startup
[exact commands: how to start frontend, backend, and any unified script]
[include any known environment constraints — e.g. "run only on Windows", "requires VPN"]

## Key files — when to read what
| File | When to open it | Key entry point |
|------|----------------|-----------------|
[one row per major file — real line numbers from Phase 1]
| [FRONTEND_ENTRY] (~N lines) | State, handlers, routing | [first handler]: L[real line] |
| [BACKEND_ENTRY] (~N lines)  | API routes, DB, I/O      | [first def/route]: L[real line] |
| [types file]                | Type definitions          | top of file |
| [api service file]          | All API calls             | top of file |
| [util files]                | Domain helpers            | top of file |

## [FRONTEND_ENTRY] — most-used functions (real lines only)
| Function | Line | Purpose |
|----------|------|---------|
[top ~15 entries from Phase 1 grep — one-phrase purpose per row]

## [BACKEND_ENTRY] — routes by domain (real lines only)
### [Domain Group 1, e.g. Core Data]
[route + line pairs]
### [Domain Group 2, e.g. Auth]
[route + line pairs]
### [Domain Group N ...]
[route + line pairs]

## View / Route modes
[exact string values found in Phase 1 scan — never guessed]

## Hard rules — never violate
[List project-specific rules found in CLAUDE.md / STYLEGUIDE.md / README.md.
 Always include at minimum:]
- Never inline business logic that belongs in a dedicated util/service file
- Never redefine types locally — use the canonical types file
- All cross-component/module state lives in [FRONTEND_ENTRY or store] — props down, callbacks up
- [any project-specific fetch / date / alert / CSS rules]
- [any environment constraints: OS, localhost access, etc.]
```

---

## PHASE 4 — Update docs_canonical/ARCHITECTURE.md (partial only)

Do **not** rewrite sections you have not verified. Only update:

1. Version number in the header → use PROJECT_VERSION from Phase 0
2. Frontend State table → add any new state variables found in Phase 1
3. View/route mode union → update if values have changed
4. API endpoint table → add any new routes found in Phase 1

For any section you cannot verify without reading more code, leave existing text and append:
`[unverified as of update — check [FRONTEND_ENTRY]]`

---

## PHASE 5 — Create scripts/update_index.py

This script keeps REPO_MAP.md line numbers fresh after refactors.
**Adapt TARGET_FILES to match this project's actual entry points.**

```python
#!/usr/bin/env python3
"""
update_index.py
Scans project entry files and rewrites function/route line-number tables
in docs_canonical/REPO_MAP.md. Run after any significant refactor.

CONFIGURATION: Edit TARGET_FILES below to match this project.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # project root

# ── CONFIGURE FOR THIS PROJECT ─────────────────────────────────────────────
# Add or remove entries. Each tuple: (filepath_relative_to_ROOT, file_type)
# file_type options: "tsx" | "ts" | "py_flask" | "py_fastapi" | "js_express"
TARGET_FILES = [
    ("App.tsx",  "tsx"),       # ← replace with real FRONTEND_ENTRY
    ("opp.py",   "py_flask"),  # ← replace with real BACKEND_ENTRY
]
# ───────────────────────────────────────────────────────────────────────────


def scan_tsx_ts(filepath: Path) -> list[tuple[str, int]]:
    """Top-level handler/fetcher/action functions."""
    results = []
    pattern = re.compile(
        r'^\s{0,4}(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(fetch\w+|handle\w+|load\w+|on[A-Z]\w+|get[A-Z]\w+)\s*=)'
    )
    for i, line in enumerate(filepath.read_text(encoding="utf-8").splitlines(), 1):
        m = pattern.match(line)
        if m:
            name = m.group(1) or m.group(2)
            if name:
                results.append((name, i))
    return results


def scan_py_flask(filepath: Path) -> list[tuple[str, str, int]]:
    """Flask @app.route / @bp.route → (route, handler_fn, line)."""
    results = []
    lines = filepath.read_text(encoding="utf-8").splitlines()
    pending_route = None
    for i, line in enumerate(lines, 1):
        m = re.match(r"@(?:app|bp)\.route\('([^']+)'", line)
        if m:
            pending_route = (m.group(1), i)
        elif pending_route and re.match(r'^(?:async\s+)?def (\w+)', line):
            fn = re.match(r'^(?:async\s+)?def (\w+)', line).group(1)
            results.append((pending_route[0], fn, pending_route[1]))
            pending_route = None
    return results


def scan_py_fastapi(filepath: Path) -> list[tuple[str, str, int]]:
    """FastAPI @app.get/post/... → (method:route, handler_fn, line)."""
    results = []
    lines = filepath.read_text(encoding="utf-8").splitlines()
    pending = None
    for i, line in enumerate(lines, 1):
        m = re.match(r"@(?:app|router)\.(get|post|put|delete|patch)\(['\"]([^'\"]+)", line)
        if m:
            pending = (f"{m.group(1).upper()} {m.group(2)}", i)
        elif pending and re.match(r'^(?:async\s+)?def (\w+)', line):
            fn = re.match(r'^(?:async\s+)?def (\w+)', line).group(1)
            results.append((pending[0], fn, pending[1]))
            pending = None
    return results


def scan_js_express(filepath: Path) -> list[tuple[str, str, int]]:
    """Express router.get/post/... → (method:route, handler_fn, line)."""
    results = []
    for i, line in enumerate(filepath.read_text(encoding="utf-8").splitlines(), 1):
        m = re.match(r"(?:router|app)\.(get|post|put|delete|patch)\(['\"]([^'\"]+)", line)
        if m:
            results.append((f"{m.group(1).upper()} {m.group(2)}", "→", i))
    return results


SCANNERS = {
    "tsx":        scan_tsx_ts,
    "ts":         scan_tsx_ts,
    "py_flask":   scan_py_flask,
    "py_fastapi": scan_py_fastapi,
    "js_express": scan_js_express,
}


def build_fn_table(entries: list[tuple[str, int]]) -> str:
    rows = ["| Handler / Function | Line |", "|--------------------|------|"]
    for name, line in entries:
        rows.append(f"| `{name}` | {line} |")
    return "\n".join(rows)


def build_route_table(entries: list[tuple]) -> str:
    rows = ["| Route | Handler | Line |", "|-------|---------|------|"]
    for e in entries:
        if len(e) == 3:
            rows.append(f"| `{e[0]}` | `{e[1]}` | {e[2]} |")
    return "\n".join(rows)


def update_repo_map():
    repo_map = ROOT / "docs_canonical" / "REPO_MAP.md"
    if not repo_map.exists():
        print("REPO_MAP.md not found — create it first per CANONICAL_INSTRUCTIONS.md")
        return

    content = repo_map.read_text(encoding="utf-8")

    for rel_path, file_type in TARGET_FILES:
        filepath = ROOT / rel_path
        if not filepath.exists():
            print(f"WARNING: {rel_path} not found — skipping")
            continue

        scanner = SCANNERS.get(file_type)
        if not scanner:
            print(f"WARNING: unknown file_type '{file_type}' for {rel_path} — skipping")
            continue

        entries = scanner(filepath)
        line_count = len(filepath.read_text(encoding="utf-8").splitlines())
        filename = filepath.name

        is_route_file = file_type in ("py_flask", "py_fastapi", "js_express")
        table = build_route_table(entries) if is_route_file else build_fn_table(entries)
        kind  = "Route Map" if is_route_file else "Function Map"

        header = f"## {filename} {kind} (~{line_count} lines)"
        block  = f"{header}\n{table}\n"

        pattern = rf"## {re.escape(filename)} {kind}[^\n]*\n.*?(?=\n## |\Z)"
        new_content = re.sub(pattern, block, content, flags=re.DOTALL)

        if new_content == content:
            print(f"NOTE: No existing section for '{filename} {kind}' in REPO_MAP.md — appending")
            content += f"\n{block}"
        else:
            content = new_content

        print(f"{filename}: {len(entries)} entries updated in REPO_MAP.md")

    repo_map.write_text(content, encoding="utf-8")
    print("REPO_MAP.md update complete.")


if __name__ == "__main__":
    update_repo_map()
```

After creating the file, run it immediately:

```bash
python scripts/update_index.py
```

If it fails, fix the script before moving on.

---

## COMPLETION CHECKLIST

Before declaring done, verify every item:

- [ ] REPO_MAP.md — version header matches real codebase version
- [ ] REPO_MAP.md — every line number verified against grep output (no stale copies)
- [ ] REPO_MAP.md — no functions or routes omitted from grep results
- [ ] AGENT_QUICKREF.md — version header matches real codebase version
- [ ] AGENT_QUICKREF.md — frontend handler lines are real (not from old docs)
- [ ] AGENT_QUICKREF.md — backend routes are real and grouped by domain
- [ ] AGENT_QUICKREF.md — view/route mode values match actual code
- [ ] AGENT_QUICKREF.md — hard rules section reflects actual project constraints
- [ ] ARCHITECTURE.md — version header updated; unverified sections flagged
- [ ] scripts/update_index.py — TARGET_FILES configured, runs without error

---

## WHAT NOT TO DO

- Do NOT copy line numbers from existing docs — they are likely stale
- Do NOT invent or estimate line numbers — only use grep/scan output
- Do NOT delete any file
- Do NOT modify any source code (entry files, components, routes, etc.)
- Do NOT add new canonical files beyond what already exists in docs_canonical/
- Do NOT rewrite ARCHITECTURE.md sections you haven't verified in Phase 1

# AGENT MASTER GUIDE
> One file. Drop it in your project. Claude and Gemini both operate at peak performance.
> Universal standing order for any agent on any codebase — follow every step in order.

---

## 0. Why This Structure Works

Most projects start with just a single MD file — and that's why they stay basic.
A properly structured agent setup solves four compounding problems:

| Problem | Solution |
|---------|----------|
| **Re-explaining every session** | Agent reads the MD and is immediately productive — no re-setup |
| **Stale line numbers → whole-file reads** | docs_canonical/ provides exact line targets — one targeted read per task |
| **Inconsistent output quality** | Rules are in files, not memory — same standard every session, automatically |
| **Single point of failure** | Any agent or teammate onboards from the file structure in minutes |

**The core insight:** Set it up once → every session improves. Skip it → every session starts from zero.

---

## 1. Core Philosophy

| Principle | Rule |
|-----------|------|
| **One-Stop MD** | Each AI reads only its own MD and can handle 80% of tasks |
| **Ownership separation** | Rules/patterns owned by MD files · Line maps/versions owned by canonical files |
| **No duplication** | If the same content appears in two places, remove it from one |
| **Mechanical procedures** | No guidelines requiring judgment — checklists only |

---

## 2. File Structure & Ownership

```
project-root/
├── CLAUDE.md           ← Claude-only one-stop reference
├── ANTIGRAVITY.md      ← Gemini-only one-stop reference
└── docs_canonical/
    ├── REPO_MAP.md          ← Always update on /dock (line numbers)
    ├── AGENT_QUICKREF.md    ← Loaded every session — self-sufficient quick reference
    ├── ARCHITECTURE.md      ← Update only when structure changes
    ├── STYLEGUIDE.md        ← Update only when conventions change
    └── WORKFLOWS.md         ← Update only when build/deploy changes
                               (includes TESTING content)
```

### Ownership Rules (prevents duplication)
| Content | Owned By | Everywhere Else |
|---------|----------|-----------------|
| Hard rules, prohibitions | CLAUDE.md · ANTIGRAVITY.md | Never mention |
| Output behavior rules | CLAUDE.md · ANTIGRAVITY.md | Never mention |
| Core line map (abbreviated) | CLAUDE.md · ANTIGRAVITY.md | — |
| Full detailed line map | REPO_MAP.md | — |
| Session quick reference | AGENT_QUICKREF.md | — |
| Session commands (/dock, /survey) | CLAUDE.md · ANTIGRAVITY.md | Never mention |
| Data flow, sync strategy | ARCHITECTURE.md | — |
| UI patterns, DB schema | STYLEGUIDE.md | — |
| Build, test procedures | WORKFLOWS.md | — |

---

## 3. CLAUDE.md Template Structure

```markdown
# [Project Name] — Claude Agent Reference (vX.X.X)
> This file is Claude's primary reference. Reading this alone covers 80% of tasks.

## 1. HARD RULES (Never Violate)

### Environment
- [Execution constraints — Mac/Windows separation, DB location, etc.]

### Code
- [Language-specific prohibitions — inline fetch, alert(), any, etc.]

### Communication
- Korean for conversation, English for code/docs
- Git = Commit + Push (push immediately after commit)
- Minimal diff — targeted snippets, not full file overwrites

### Output Behavior (Token Efficiency)
- No sycophantic openers — answer is always line 1. Never "Sure!", "Great question!", "Absolutely!"
- No hollow closings — never "I hope this helps! Let me know if you need anything!"
- No prompt restatement — execute immediately, do not repeat back what was asked
- ASCII-only output — no em dashes (--), smart quotes, or Unicode characters that break parsers
- No "As an AI..." framing — ever
- No unsolicited suggestions — exact scope only, nothing beyond what was asked
- No unnecessary disclaimers — omit unless there is a genuine safety risk
- Simplest working solution — no abstractions or over-engineering that was not requested
- Uncertain facts → say "I don't know" — never guess or hallucinate
- User correction becomes session ground truth — never push back with "You're absolutely right but..."
- Never read the same file twice in one session
- Never touch code outside the explicit scope of the request

## 2. PROJECT OVERVIEW
- One-line project description
- Stack, view modes, etc.

## 3. KEY FILES & LINE MAP
- 5–10 core files + frequently used handler line numbers (abbreviated)
- Full line map → docs_canonical/REPO_MAP.md

## 4. CODING PATTERNS
- Framework patterns, UI style, state management, naming

## 5. DATA FLOW
- Architecture diagram (1–5 lines)

## 6. SESSION COMMANDS

### `/dock` — End of session
1. **Version bump** — determine bump type, then update package.json (or pyproject.toml):
   - `patch` (0.0.n) → bug fixes, typos, minor tweaks — no new behavior
   - `minor` (0.n.0) → new feature or visible behavior change — reset patch to 0
   - `major` (n.0.0) → breaking change or full redesign — reset minor + patch to 0
   - Carry rule: if any digit reaches 10, increment the digit to its left and reset to 0
     (e.g. 1.9.9 + minor → minor becomes 10 → carry → 2.0.0, NOT 1.10.0)
2. **Version sync** — propagate the new version string to:
   README.md header · CLAUDE.md header · ANTIGRAVITY.md header
3. **REPO_MAP.md update** — re-scan real line numbers for FRONTEND_ENTRY + BACKEND_ENTRY
   (never copy from memory — always grep)
4. **Conditional canonical updates** (skip each file if its condition is not met):
   - ARCHITECTURE.md → only if new view mode, API route, or data flow was added
   - STYLEGUIDE.md  → only if a new convention was introduced
   - WORKFLOWS.md   → only if build/deploy/test process changed
5. **README.md** — append one-line change summary under the new version heading
6. **git commit + push** — commit message format: `vX.X.X — [one-line summary]`

### `/survey` — Full code inspection
1. **Type check** — npx tsc --noEmit (or project-equivalent); report all errors
2. **Glitch & bug scan**
   - Runtime errors: unhandled promise rejections, missing null checks, off-by-one
   - Logic bugs: incorrect conditionals, state mutation side-effects, race conditions
3. **Feature / function sync**
   - Every frontend-callable action must have a matching backend handler
   - Every backend route must be reachable from the frontend (no orphaned endpoints)
   - Flag any feature that exists on one side but not the other
4. **UI consistency audit**
   - Component patterns: spacing, color tokens, typography follow STYLEGUIDE.md
   - No one-off inline styles that bypass the design system
   - Repeated UI blocks that should be extracted into a shared component
5. **Integrity check**
   - Types: all API response shapes match their TypeScript types / Pydantic models
   - Routes: every route in REPO_MAP.md still exists in real code (no ghost entries)
   - Data flow: state updates reach all dependent views without stale closures
6. **Hard Rule violations** — scan for any breach of CLAUDE.md Section 1 rules
7. **Report** — output in three tiers:
   - Critical — must fix before next commit
   - Warning  — fix within this session if time allows
   - Info     — low-priority / nice-to-have improvements

## 7. DEEP DIVE (only when needed)
| Doc | Content | When |
|-----|---------|------|
| REPO_MAP.md | Full line map | Finding a function |
| ARCHITECTURE.md | Data flow | Adding a new module |
| STYLEGUIDE.md | UI/DB conventions | UI work |
| WORKFLOWS.md | Build/test | Deploy-related work |
```

---

## 4. ANTIGRAVITY.md Template Structure

**Same content as CLAUDE.md**, format differences only:
- Use `> [!IMPORTANT]` blocks for emphasis
- Section 7: plain path text instead of markdown links
- All rules, /dock, /survey procedures: 100% identical to CLAUDE.md

---

## 5. Canonical File Header Rules

Add this comment at the top of each file so sub-agents know exactly when to update:

```markdown
# REPO_MAP — [Project] (vX.X.X)
<!-- Update on /dock: always — re-scan line numbers + version sync -->
```

```markdown
# ARCHITECTURE — [Project] (vX.X.X)
<!-- Update on /dock: only if new view mode, API route, or data flow was added. Skip otherwise. -->
```

```markdown
# STYLEGUIDE — [Project] (vX.X.X)
<!-- Update on /dock: only if a new convention was introduced. Skip otherwise. -->
```

```markdown
# WORKFLOWS — [Project] (vX.X.X)
<!-- Update on /dock: only if build/deploy process changed. Skip otherwise. -->
```

---

## 6. One-Time Global Registration (Run Once Per Machine)

When you receive `AGENT_MASTER_GUIDE.md` for the first time, register it globally
**before** starting any project setup. This ensures every future project inherits
these standards automatically, without needing the file re-provided each session.

### For Claude (`~/.claude/`)

```bash
mkdir -p ~/.claude
cp AGENT_MASTER_GUIDE.md ~/.claude/AGENT_MASTER_GUIDE.md

cat >> ~/.claude/CLAUDE.md << 'EOF'

## Global Agent Standards
The following guide applies to ALL projects on this machine.
Read it at the start of any new project setup.

- Master guide (setup, rules, /dock, /survey, canonical bootstrap): ~/.claude/AGENT_MASTER_GUIDE.md
EOF
```

### For Antigravity (`~/.agents/`)

```bash
mkdir -p ~/.agents
cp AGENT_MASTER_GUIDE.md ~/.agents/AGENT_MASTER_GUIDE.md

cat >> ~/.agents/ANTIGRAVITY.md << 'EOF'

## Global Agent Standards
The following guide applies to ALL projects on this machine.
Read it at the start of any new project setup.

- Master guide (setup, rules, /dock, /survey, canonical bootstrap): ~/.agents/AGENT_MASTER_GUIDE.md
EOF
```

### Verification

```bash
ls ~/.claude/AGENT_MASTER_GUIDE.md
ls ~/.agents/AGENT_MASTER_GUIDE.md
grep "Global Agent Standards" ~/.claude/CLAUDE.md
grep "Global Agent Standards" ~/.agents/ANTIGRAVITY.md
```

> **Important:** One-time per machine. If the file is updated, re-run `cp` to overwrite.

---

## 7. Per-Project Setup Procedure

1. **Understand the codebase** (5 min)
   - Stack, entry points, 5–10 core files, execution environment constraints

2. **Write CLAUDE.md** (from Section 3 template above)
   - Hard Rules → Project Overview → Key Files → Patterns → Data Flow → /dock + /survey

3. **Write ANTIGRAVITY.md** (based on CLAUDE.md)
   - Same content, markdown links → plain path text only

4. **Create docs_canonical/** — follow Phase 0–5 in Section 8 below

5. **Add update-policy comment** to top of each canonical file (see Section 5)

6. **Validate**: "Can I start working after reading only this MD?" self-check

---

## 8. docs_canonical/ Bootstrap (Phase 0–5)

> Never skip. Never trust existing doc content — always verify against real code.
> Goal: one targeted read per task, zero blind searches.

### PHASE 0 — Identify this project's shape

```bash
# Language / framework
ls package.json pyproject.toml go.mod Cargo.toml pom.xml 2>/dev/null

# Entry-point files
ls *.tsx *.ts src/main.* src/App.* main.py app.py server.py index.* 2>/dev/null

# Backend file
ls *.py src/server.* src/routes.* routes/ 2>/dev/null

# Directory structure
find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' \
       -not -path '*/dist/*' -not -path '*/__pycache__/*' | sort

# Current version
grep -m1 '"version"' package.json 2>/dev/null \
  || grep -m1 '^version' pyproject.toml 2>/dev/null \
  || grep -m3 "^## v\|^# v\|v[0-9]\+\.[0-9]" CHANGELOG.md README.md 2>/dev/null | head -3
```

Record: **FRONTEND_ENTRY** · **BACKEND_ENTRY** · **PROJECT_VERSION** · **STACK**

---

### PHASE 1 — Scan real code (ground truth)

**Never invent a line number. Every number must come from grep output.**

```bash
# Frontend: handlers, state, routes
grep -n "^\s*const \(fetch\|handle\|load\|on[A-Z]\|get[A-Z]\|set[A-Z]\)\w\+ \?=" $FRONTEND_ENTRY
grep -n "^export \(default \)\?function\|^const \w\+ = (" $FRONTEND_ENTRY | head -40
grep -n "useState\|useReducer\|createStore\|defineStore" $FRONTEND_ENTRY | head -30
grep -n "route\|path\|viewMode\|PageName\|View\b" $FRONTEND_ENTRY | head -20
wc -l $FRONTEND_ENTRY

# Backend: routes and functions
grep -n "^@app\.route\|^@bp\.route\|^@router\." $BACKEND_ENTRY          # Flask
grep -n "@app\.\(get\|post\|put\|delete\|patch\)\|@router\." $BACKEND_ENTRY  # FastAPI
grep -n "router\.\(get\|post\|put\|delete\|patch\)\|app\.\(get\|post\)" $BACKEND_ENTRY  # Express
grep -n "path(\|url(" $BACKEND_ENTRY                                      # Django
grep -n "^def \|^class \|^async def \|^function \|^export function" $BACKEND_ENTRY | head -50
wc -l $BACKEND_ENTRY

# Project-wide
ls components/ pages/ views/ hooks/ services/ utils/ helpers/ \
   lib/ api/ routes/ middleware/ store/ constants/ types/ 2>/dev/null
find . -name "types.ts" -o -name "types.tsx" -o -name "*.d.ts" \
   -not -path '*/node_modules/*' 2>/dev/null | head -10
```

Save all output. Do not proceed until you have real line numbers.

---

### PHASE 2 — Write docs_canonical/REPO_MAP.md

```markdown
# REPOSITORY MAP — [PROJECT NAME] (v[PROJECT_VERSION])
Stack: [STACK]

## Directory Layout
[paste actual tree from Phase 0 — only real directories/files]

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
[list real files from Phase 1]

## Notes
- Check this map before opening any large file. Use Read with offset+limit.
- [anomalies: legacy folders, duplicate files, generated code, etc.]
```

---

### PHASE 3 — Write docs_canonical/AGENT_QUICKREF.md

```markdown
# AGENT QUICK REFERENCE — [PROJECT NAME] (v[PROJECT_VERSION])
> Read this first. Jump directly to line numbers. Do not read full files.

## Project
[2–3 sentences: what this app does, who uses it, core data model]

## Stack
[STACK — exact versions if available]

## Dev startup
[exact commands to start frontend, backend, any unified script]
[include environment constraints — e.g. "run only on Windows", "requires VPN"]

## Key files — when to read what
| File | When to open it | Key entry point |
|------|----------------|-----------------|
| [FRONTEND_ENTRY] (~N lines) | State, handlers, routing | [first handler]: L[real line] |
| [BACKEND_ENTRY] (~N lines)  | API routes, DB, I/O      | [first def/route]: L[real line] |
| [types file]                | Type definitions          | top of file |
| [api service file]          | All API calls             | top of file |

## [FRONTEND_ENTRY] — most-used functions (real lines only)
| Function | Line | Purpose |
|----------|------|---------|
[top ~15 entries from Phase 1 grep]

## [BACKEND_ENTRY] — routes by domain (real lines only)
### [Domain Group 1]
[route + line pairs]
### [Domain Group N]
[route + line pairs]

## View / Route modes
[exact string values from Phase 1 scan — never guessed]

## Project-specific hard rules
[rules unique to THIS project only — fetch patterns, DB access, CSS constraints, etc.]
[do NOT repeat output behavior or communication rules — those live in CLAUDE.md Section 1]
```

---

### PHASE 4 — Update docs_canonical/ARCHITECTURE.md (partial only)

Do **not** rewrite sections you have not verified. Only update:
1. Version number in the header
2. Frontend State table — add new state variables from Phase 1
3. View/route mode union — update if values changed
4. API endpoint table — add new routes from Phase 1

Unverified sections: leave existing text and append `[unverified as of update — check [FRONTEND_ENTRY]]`

---

### PHASE 5 — Create scripts/update_index.py

This script keeps REPO_MAP.md line numbers fresh after refactors.

```python
#!/usr/bin/env python3
"""
update_index.py — Scans entry files and rewrites line-number tables in REPO_MAP.md.
Run after any significant refactor. Edit TARGET_FILES to match this project.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TARGET_FILES = [
    ("App.tsx",  "tsx"),       # replace with real FRONTEND_ENTRY
    ("app.py",   "py_flask"),  # replace with real BACKEND_ENTRY
]

def scan_tsx_ts(filepath):
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

def scan_py_flask(filepath):
    results, lines, pending = [], filepath.read_text(encoding="utf-8").splitlines(), None
    for i, line in enumerate(lines, 1):
        m = re.match(r"@(?:app|bp)\.route\('([^']+)'", line)
        if m:
            pending = (m.group(1), i)
        elif pending and re.match(r'^(?:async\s+)?def (\w+)', line):
            fn = re.match(r'^(?:async\s+)?def (\w+)', line).group(1)
            results.append((pending[0], fn, pending[1]))
            pending = None
    return results

def scan_py_fastapi(filepath):
    results, lines, pending = [], filepath.read_text(encoding="utf-8").splitlines(), None
    for i, line in enumerate(lines, 1):
        m = re.match(r"@(?:app|router)\.(get|post|put|delete|patch)\(['\"]([^'\"]+)", line)
        if m:
            pending = (f"{m.group(1).upper()} {m.group(2)}", i)
        elif pending and re.match(r'^(?:async\s+)?def (\w+)', line):
            fn = re.match(r'^(?:async\s+)?def (\w+)', line).group(1)
            results.append((pending[0], fn, pending[1]))
            pending = None
    return results

def scan_js_express(filepath):
    results = []
    for i, line in enumerate(filepath.read_text(encoding="utf-8").splitlines(), 1):
        m = re.match(r"(?:router|app)\.(get|post|put|delete|patch)\(['\"]([^'\"]+)", line)
        if m:
            results.append((f"{m.group(1).upper()} {m.group(2)}", "->", i))
    return results

SCANNERS = {"tsx": scan_tsx_ts, "ts": scan_tsx_ts,
            "py_flask": scan_py_flask, "py_fastapi": scan_py_fastapi,
            "js_express": scan_js_express}

def build_fn_table(entries):
    rows = ["| Handler / Function | Line |", "|--------------------|------|"]
    for name, line in entries:
        rows.append(f"| `{name}` | {line} |")
    return "\n".join(rows)

def build_route_table(entries):
    rows = ["| Route | Handler | Line |", "|-------|---------|------|"]
    for e in entries:
        if len(e) == 3:
            rows.append(f"| `{e[0]}` | `{e[1]}` | {e[2]} |")
    return "\n".join(rows)

def update_repo_map():
    repo_map = ROOT / "docs_canonical" / "REPO_MAP.md"
    if not repo_map.exists():
        print("REPO_MAP.md not found — create it first (Phase 2)")
        return
    content = repo_map.read_text(encoding="utf-8")
    for rel_path, file_type in TARGET_FILES:
        filepath = ROOT / rel_path
        if not filepath.exists():
            print(f"WARNING: {rel_path} not found — skipping")
            continue
        scanner = SCANNERS.get(file_type)
        if not scanner:
            print(f"WARNING: unknown file_type '{file_type}' — skipping")
            continue
        entries = scanner(filepath)
        line_count = len(filepath.read_text(encoding="utf-8").splitlines())
        filename = filepath.name
        is_route = file_type in ("py_flask", "py_fastapi", "js_express")
        table = build_route_table(entries) if is_route else build_fn_table(entries)
        kind  = "Route Map" if is_route else "Function Map"
        header = f"## {filename} {kind} (~{line_count} lines)"
        block  = f"{header}\n{table}\n"
        pattern = rf"## {re.escape(filename)} {kind}[^\n]*\n.*?(?=\n## |\Z)"
        new_content = re.sub(pattern, block, content, flags=re.DOTALL)
        if new_content == content:
            print(f"NOTE: No existing section for '{filename}' — appending")
            content += f"\n{block}"
        else:
            content = new_content
        print(f"{filename}: {len(entries)} entries updated")
    repo_map.write_text(content, encoding="utf-8")
    print("REPO_MAP.md update complete.")

if __name__ == "__main__":
    update_repo_map()
```

Run immediately after creating:
```bash
python scripts/update_index.py
```

---

## 9. /dock · /survey Reference

| Command | Trigger | Steps |
|---------|---------|-------|
| `/dock` | End of session | Version bump → Version sync → REPO_MAP re-scan → Conditional canonical updates → README → git commit + push |
| `/survey` | Full inspection | Type check → Glitch & bug scan → Feature/function sync → UI consistency → Integrity check → Hard Rule violations → Critical/Warning/Info report |

**Version bump quick reference:**

| Change type | Example | Bump |
|-------------|---------|------|
| Bug fix, typo | Fixed null crash on load | patch |
| New feature | Added CSV export | minor |
| Breaking redesign | Rewrote state architecture | major |
| Digit hits 10 | 1.9.9 + minor | → 2.0.0 (carry rule) |

---

## 10. Completion Checklist

Before declaring setup done, verify every item:

- [ ] REPO_MAP.md — version header matches real codebase version
- [ ] REPO_MAP.md — every line number verified against grep output (no stale copies)
- [ ] REPO_MAP.md — no functions or routes omitted from grep results
- [ ] AGENT_QUICKREF.md — version header matches real codebase version
- [ ] AGENT_QUICKREF.md — frontend handler lines are real (not from old docs)
- [ ] AGENT_QUICKREF.md — backend routes are real and grouped by domain
- [ ] AGENT_QUICKREF.md — view/route mode values match actual code
- [ ] AGENT_QUICKREF.md — only project-specific rules listed (no duplicate global rules)
- [ ] ARCHITECTURE.md — version header updated; unverified sections flagged
- [ ] scripts/update_index.py — TARGET_FILES configured, runs without error
- [ ] CLAUDE.md and ANTIGRAVITY.md — content identical, format differs only

---

## 11. Mistakes & What Not To Do

| Mistake | Prevention |
|---------|-----------|
| Updating all canonical files on /dock | Check each file's update-policy comment — skip if condition not met |
| Writing rules inside canonical files | Rules belong only in CLAUDE.md · ANTIGRAVITY.md |
| Duplicating output/communication rules in AGENT_QUICKREF.md | Those live in CLAUDE.md Section 1 — reference only |
| CLAUDE.md and ANTIGRAVITY.md diverging | Compare both after writing |
| Stale line numbers | REPO_MAP must always be re-scanned on every /dock — never copy from memory |
| Inventing or estimating line numbers | Only use grep/scan output |
| Keeping TESTING.md as a separate file | Merge into WORKFLOWS.md |
| Rewriting ARCHITECTURE.md sections not verified in Phase 1 | Leave existing text, append [unverified] tag |
| Modifying source code during setup | Read only — never touch entry files, components, or routes |

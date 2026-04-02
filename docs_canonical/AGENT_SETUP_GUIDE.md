# Agent Documentation System Guide
> Apply this guide to any project so Claude and Gemini both operate at peak performance.

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
    ├── REPO_MAP.md     ← Always update on /dock (line numbers)
    ├── ARCHITECTURE.md ← Update only when structure changes
    ├── STYLEGUIDE.md   ← Update only when conventions change
    └── WORKFLOWS.md    ← Update only when build/deploy changes
                          (includes TESTING content)
```

### Ownership Rules (prevents duplication)
| Content | Owned By | Everywhere Else |
|---------|----------|-----------------|
| Hard rules, prohibitions | CLAUDE.md · ANTIGRAVITY.md | Never mention |
| Core line map (abbreviated) | CLAUDE.md · ANTIGRAVITY.md | — |
| Full detailed line map | REPO_MAP.md | — |
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
1. Version sync: package.json → README, CLAUDE.md, ANTIGRAVITY.md headers
2. REPO_MAP.md update: re-scan line numbers for App.tsx / main backend file
3. Conditional canonical updates (skip if no change):
   - ARCHITECTURE.md → only if new view/API/flow was added
   - STYLEGUIDE.md → only if new convention was introduced
   - WORKFLOWS.md → only if build/deploy process changed
4. README.md: add change summary if new version
5. git commit + push

### `/survey` — Full code inspection
1. Type check: npx tsc --noEmit (or project-equivalent)
2. Frontend: type mismatches, unused imports, Hard Rule violations
3. Backend: missing routes, SQL risks, bare except, unused imports
4. Cross-check: API endpoints ↔ backend routes, types ↔ response shapes
5. Report: Critical / Warning / Info

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

## 5. canonical/ File Header Rules

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

## 6. New Project Setup Procedure

1. **Understand the codebase** (5 min)
   - Stack, entry points, 5–10 core files, execution environment constraints

2. **Write CLAUDE.md** (from template above)
   - Hard Rules → Project Overview → Key Files → Patterns → Data Flow → /dock + /survey

3. **Write ANTIGRAVITY.md** (based on CLAUDE.md)
   - Same content, markdown links → plain path text only

4. **Create docs_canonical/**
   - REPO_MAP.md: full function/route line map
   - ARCHITECTURE.md: data flow, sync strategy
   - STYLEGUIDE.md: coding conventions, naming, UI patterns
   - WORKFLOWS.md: build, deploy, test (merge TESTING here)

5. **Add update-policy comment** to top of each canonical file

6. **Validate**: "Can I start working after reading only this MD?" self-check

---

## 7. /dock · /survey Reference

| Command | Trigger | Action |
|---------|---------|--------|
| `/dock` | End of session | Version sync → REPO_MAP update → conditional canonical updates → README → git commit + push |
| `/survey` | Full inspection requested | TypeCheck → Frontend → Backend → Cross-check → Critical/Warning/Info report |

**Key principle**: Both commands are ordered checklists requiring zero judgment — even a sub-agent can follow them mechanically.

---

## 8. Common Mistakes to Avoid

| Mistake | Prevention |
|---------|-----------|
| Updating all canonical files on /dock | Check each file's update-policy comment, skip if condition not met |
| Writing rules inside canonical files | Rules belong only in CLAUDE.md · ANTIGRAVITY.md |
| CLAUDE.md and ANTIGRAVITY.md diverging | Compare both after writing |
| Stale line numbers | REPO_MAP must always be re-scanned on every /dock |
| Keeping TESTING.md as a separate file | Merge into WORKFLOWS.md, leave only a pointer in TESTING.md |

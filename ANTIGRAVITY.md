# 🚨 ANTIGRAVITY SYSTEM OVERRIDE (ACTIVE)
**PRIMARY REFERENCE:** This file is your one-stop shop for project rules and context.

---

## 1. Project Metadata
- **Project Name:** project6_pms
- **Core Purpose:** Hierarchical Maritime Management System (SMS/PMS) for HQ (Mother) and Vessels (Child).
- **Current Status:** Active development - Modernizing PMS/SMS with dynamic category management (Tree-based).

---

## 2. Environment & Execution (Jay's Hard Constraints)
> [!IMPORTANT]
> **DEVELOPMENT WORKFLOW:**
> - **Coding Device:** macOS (JayLight-MacPro)
> - **Execution Target:** Windows Remote (Mimic Mode) or Local Mac for dev server.
> - **Operational Rule:** Unless specified, assume Coding on Mac and Execution on Windows. Do NOT suggest running build/install commands on Mac unless explicitly asked.

---

## 3. Technology Stack Detection
- **Frontend:** React 19, Vite 8, Lucide React (Glassmorphism UI).
- **Backend:** Express 5, better-sqlite3 (Node.js).
- **Database:** SQLite (`mother/mother.db`).
- **Primary Entry Points:**
  - `mother/src/App.tsx` (HQ Dashboard)
  - `mother/server.js` (HQ API Server)
  - `child/src/App.tsx` (Vessel Application)

---

## 4. Canonical Documentation (docs_canonical/)
Maintain the "Harness Architecture" by keeping these files updated:
1. **AGENT_QUICKREF.md**: Core rules and quick lookups.
2. **ARCHITECTURE.md**: Data flow (Sync) and API schema.
3. **REPO_MAP.md**: Full function/route mapping (Line numbers).
4. **STYLEGUIDE.md**: UI tokens, coding conventions.
5. **WORKFLOWS.md**: Build, Test, and Deploy procedures.

---

## 5. Interaction Rules (Captain Jay's Standing Orders)
- **Communication:** Professional, direct, and minimalist. Use Korean for conversation, English for code/docs.
- **Tone Control:** No fawning, no unnecessary apologies, no community jargon.
- **Code Integrity:** Prioritize stability. Always check `docs_canonical/` before modifying core logic.
- **Minimal Diff:** Provide targeted code snippets instead of overwriting entire files.
- **Git Flow:** Git = Commit + Push immediately.
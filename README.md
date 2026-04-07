# Project6_PMS (Prism) — Maritime Management System (v1.2.0)
> **Hierarchical PMS/SMS System** for Global Fleet Management (Mother HQ) and Vessel Operations (Child).

## 🚀 Overview
Project6_PMS is a modern, high-density maritime management platform designed for hierarchical compliance tracking (SMS) and planned maintenance (PMS). It uses a "Mother/Child" architecture to synchronize data between shore-side headquarters and offshore vessels.

## 📁 Project Structure
The repository is divided into four main domains:

- **[`/mother`](./mother)**: HQ Command Center. React/Vite frontend + Express/Node backend.
- **[`/child`](./child)**: Vessel Operation Client. React/Vite frontend + Express/Node backend.
- **[`/shared`](./shared)**: Common database schemas (`schema.sql`) and synchronization logic (`sync_util.js`).
- **[`/docs_canonical`](./docs_canonical)**: The project's "Harness Architecture" documentation (Source of Truth).

## 🛠 Tech Stack
- **Frontend**: React 19, Vite 8, Lucide React (Icons).
- **Backend**: Express 5, Node.js + `better-sqlite3`.
- **Database**: SQLite (Synchronous transactions via `better-sqlite3`).
- **UI**: Glassmorphism (Vanilla CSS with global tokens).

## 🦾 AI & Copilot Support
This repository is optimized for AI-guided development consistent with the [`awesome-copilot`](https://github.com/github/awesome-copilot) standards.

- **[`.github/copilot-instructions.md`](./.github/copilot-instructions.md)**: Custom instructions for GitHub Copilot.
- **[`.cursorrules`](./.cursorrules)**: Tailored rules for Cursor AI.
- **[`CLAUDE.md`](./CLAUDE.md)**: Token efficiency and minimalist output rules.
- **[`llms.txt`](./llms.txt)** & **[`llms-full.txt`](./llms-full.txt)**: Machine-readable documentation for LLM agents.
- **[`GEMINI.md`](./GEMINI.md)**: Project-specific standing orders and hard rules (v1.1.0).

## 📜 Documentation (Harness Architecture)
Always refer to the following canonical documents before making changes:
1. **[AGENT_QUICKREF.md](./docs_canonical/AGENT_QUICKREF.md)**: Routes and Functions lookup.
2. **[ARCHITECTURE.md](./docs_canonical/ARCHITECTURE.md)**: System design and sync protocol.
3. **[REPO_MAP.md](./docs_canonical/REPO_MAP.md)**: Path and line number registry.
4. **[STYLEGUIDE.md](./docs_canonical/STYLEGUIDE.md)**: UI tokens and coding conventions.

## 🛠 Quick Start
### Mother (HQ)
```bash
cd mother
npm install
npm run dev # Frontend: http://localhost:5173
node server.js # Backend: http://localhost:3001
```

### Child (Vessel)
```bash
cd child
npm install
npm run dev
node server.js
```

---
**Maintained by Jay** | *Coding on Mac, Execution on Windows*

## Changelog
- v1.2.0: Refactored REPO_MAP, removed legacy docs (AGENT_MASTER_GUIDE, ANTIGRAVITY, IMPLEMENTATION_PLAN), updated PMS/SMS modules and BulkUploadModal

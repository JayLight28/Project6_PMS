# AGENT QUICK REFERENCE — PROJECT6_PMS (v1.0.0)
<!-- Read this first. Jump directly to line numbers. Do not read full files. -->

## Project
**Maritime Management System (PMS/SMS)**.
- **Mother HQ**: Global fleet management, dashboard mimicry, template distribution.
- **Child Vessel**: Onboard operations, local data management, synchronization.
- **Goal**: Dynamic tree-based category management for all maritime compliance.

## Stack
- **Frontend**: React 19 + Vite 8
- **Backend**: Express 5 + Node.js
- **Database**: SQLite (better-sqlite3)
- **UI**: Glassmorphism (Vanilla CSS variables)

## Dev Startup
- **Mother Frontend**: `cd mother && npm run dev` (Port 5173 default)
- **Mother Backend**: `cd mother && node server.js` (Port 3001)
- **Child Frontend**: `cd child && npm run dev`

## Key Files — When to Read What
| File | When to open it | Key Entry Point |
|------|----------------|-----------------|
| `mother/src/App.tsx` | HQ State, Dashboards, Mimic Mode | `App`: L29 |
| `mother/server.js` | HQ API, Database queries, Sync logs | `app.get('/api/fleet')`: L52 |
| `shared/schema.sql` | Table structures, constraints | Top of file |
| `shared/sync_util.js` | Data transfer logic, conflict resolution | Top of file |

## mother/src/App.tsx — Most-Used Functions
| Function | Line | Purpose |
|----------|------|---------|
| `handleSelectVessel` | 40 | Sets `selectedVessel` for Mimic Mode context. |
| `handleAddVessel` | 47 | Registers a new vessel IMO mapping. |

## mother/server.js — Routes by Domain
### Fleet Management
- `GET /api/fleet`: L52 (List all vessels)
- `POST /api/fleet`: L56 (Register new vessel)

### Global PMS Items
- `GET /api/pms/global`: L67
- `POST /api/pms/global`: L71

### SMS & Audit
- `GET /api/sms/templates`: L79
- `GET /api/logs/global`: L84

## Hard Rules — Never Violate
- **Communication**: Korean for chat, English for code/docs.
- **Git Flow**: Git = Commit + Push immediately.
- **Environment**: Coding on Mac, Execution target is Windows. Do NOT run build/install on Mac unless asked.
- **Minimal Diff**: Provide targeted snippets. Do NOT overwrite entire files.
- **Canonical Docs**: Check `docs_canonical/REPO_MAP.md` before blind searches.
- **Database**: All shared schema changes MUST be reflected in `shared/schema.sql`.

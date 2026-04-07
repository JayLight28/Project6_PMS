# AGENT QUICK REFERENCE — Project6_PMS (v1.1.0)

> Read this first. Jump directly to line numbers. Do not read full files.

## Project
**Maritime Management System (PMS/SMS)**.
- **Mother HQ**: Global fleet management, dashboard mimicry, template distribution.
- **Child Vessel**: Onboard operations, local data management, synchronization.
- **Goal**: Dynamic tree-based category management for all maritime compliance.

## Stack
- **Frontend**: Vite + React + TypeScript
- **Backend**: Express (Node.js)
- **Database**: SQLite (better-sqlite3)
- **UI**: Glassmorphism (Vanilla CSS variables)

## Dev Startup
- **Mother App**: `chmod +x run_mother.sh && ./run_mother.sh` (Starts both FE/BE)
- **Manual Mother FE**: `cd mother && npm run dev` (Port 5173)
- **Manual Mother BE**: `cd mother && node server.js` (Port 3001)
- **Child App**: `cd child && npm run dev` / `node server.js` (Port 3002)

## Key Files — When to Read What
| File | When to open it | Key Entry Point |
|------|----------------|-----------------|
| `mother/src/App.tsx` (~307 lines) | HQ State, Dashboards, Mimic Mode | `App`: L31 |
| `mother/server.js` (~442 lines) | HQ API, Database queries, Sync logs | `GET /api/fleet`: L315 |
| `child/src/App.tsx` (~233 lines)  | Vessel Operations UI | `App`: L49 |
| `child/server.js` (~175 lines)    | Vessel API & local DB | `POST /api/login`: L54 |
| `shared/sync_util.js`             | Data transfer logic | Top of file |

## mother/src/App.tsx — Most-Used Functions (Real Lines)
| Function | Line | Purpose |
|----------|------|---------|
| `fetchVessels` | 43 | Refreshes fleet registry from BE. |
| `handleSelectVessel` | 66 | Sets `selectedVessel` for Mimic Mode context. |
| `handleAddVessel` | 73 | Registers a new vessel IMO mapping. |
| `handlePushTemplates` | 96 | Triggers ZIP deployment to child vessel. |

## mother/server.js — Routes by Domain (Real Lines)
### Fleet & Sync
- `GET /api/fleet`: L315 (List all vessels)
- `POST /api/sync/prepare/:vesselId`: L26 (Prepare sync pack)
- `POST /api/fleet/:vessel_id/push-templates`: L393 (Push ZIP to vessel)

### SMS & PMS Admin
- `GET /api/sms/categories`: L119
- `GET /api/pms/items`: L265
- `GET /api/dashboard/stats`: L290

## Project-specific hard rules
<!-- Project-specific rules only — see CLAUDE.md Section 1 for global rules -->
- **Canonical Docs**: Check `docs_canonical/REPO_MAP.md` before searches.
- **No Inline Business Logic**: Keep logic in `server.js` or `sync_util.js`, NOT in components.

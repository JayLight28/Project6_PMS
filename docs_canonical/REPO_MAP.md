# REPOSITORY MAP — Project6_PMS (v1.1.0)
Stack: Vite + React + TypeScript + Express + SQLite

<!-- Update on /dock: always — re-scan line numbers + version sync -->

## Directory Layout
.
├── ANTIGRAVITY.md
├── CLAUDE.md
├── REPO_MAP.md (this file)
├── child/
│   ├── src/
│   │   ├── App.tsx (Frontend Entry - Child)
│   │   └── modules/
│   └── server.js (Backend Entry - Child)
├── mother/
│   ├── src/
│   │   ├── App.tsx (Frontend Entry - Mother)
│   │   └── modules/
│   ├── server.js (Backend Entry - Mother)
│   └── template_sync.js (Style Sync Engine)
├── shared/
│   ├── components/
│   ├── config.ts (Global App Config)
│   ├── doc_generator.js (Document Filling Service)
│   └── sync_util.js (Sync Utilities)

## Key Supporting Files
| File | Purpose |
|------|---------|
| `shared/schema.sql` | Canonical database schema for both Mother and Child. |
| `shared/config.ts` | Centralized constants (API URLs, Ports, Marine Email limits). |
| `shared/doc_generator.js` | Business logic for Filling Word/Excel nodes with smart font-shrinking. |
| `mother/template_sync.js` | Logic for modifying physical Word/Excel files from web UI settings. |
| `shared/sync_util.js` | Utilities for delta synchronization between Mother/Child. |
| `mother/mother.db` | Local SQLite database for the HQ node. |
| `docs_canonical/SYSTEM_SPEC.md` | Functional requirements and business logic details. |

## Notes
- **Token Efficiency**: Check this map before opening any large file.
- **Mimic Mode**: HQ uses "Mimic Mode" to view vessel data (see `mother/src/App.tsx` L135).

## mother/server.js Route Map (~466 lines)
| Route / Method | Handler Function | Line |
|----------------|-----------------|------|
| `GET /api/sync/prepare/:vesselId` | → | 27 |
| `POST /api/sync/push-all` | → | 39 |
| `GET /api/sync/download/:vesselId/:index` | → | 56 |
| `GET /api/sms/categories` | → | 120 |
| `POST /api/sms/categories` | → | 124 |
| `PUT /api/sms/categories/:id` | → | 134 |
| `DELETE /api/sms/categories/:id` | → | 143 |
| `GET /api/sms/templates` | → | 152 |
| `POST /api/sms/templates` | → | 156 |
| `PUT /api/sms/templates/:id` | → | 166 |
| `POST /api/sms/templates/:id/sync-style` | → | 177 |
| `DELETE /api/sms/templates/:id` | → | 203 |
| `POST /api/admin/bulk-upload` | → | 212 |
| `GET /api/pms/categories` | → | 262 |
| `POST /api/pms/categories` | → | 266 |
| `PUT /api/pms/categories/:id` | → | 276 |
| `DELETE /api/pms/categories/:id` | → | 285 |
| `GET /api/pms/items` | → | 293 |
| `POST /api/pms/items` | → | 304 |
| `GET /api/dashboard/stats` | → | 318 |
| `GET /api/fleet` | → | 343 |
| `POST /api/fleet` | → | 363 |
| `PUT /api/fleet/:vessel_id` | → | 374 |
| `GET /api/sync/restore/:vessel_id` | → | 385 |
| `POST /api/sync/import-from-vessel` | → | 405 |
| `POST /api/fleet/:vessel_id/push-templates` | → | 421 |
| `GET /api/logs/global` | → | 457 |

## child/server.js Route Map (~207 lines)
| Route / Method | Handler Function | Line |
|----------------|-----------------|------|
| `POST /api/login` | → | 55 |
| `GET /api/templates` | → | 67 |
| `GET /api/pms/categories` | → | 72 |
| `GET /api/pms/items` | → | 76 |
| `POST /api/pms/complete` | → | 87 |
| `GET /api/documents` | → | 111 |
| `POST /api/documents` | → | 121 |
| `PUT /api/documents/:id` | → | 129 |
| `GET /api/documents/:id/download` | → | 148 |
| `POST /api/sync/export` | → | 188 |
| `POST /api/sync/import` | → | 198 |

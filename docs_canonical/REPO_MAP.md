# REPOSITORY MAP — Project6_PMS (v1.0.2)
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
│   └── server.js (Backend Entry - Mother)
├── shared/
│   ├── components/
│   └── sync_util.js
| `/api/sms/templates/:id` | DELETE | 175 |
| `/api/admin/bulk-upload` | POST | 184 |
| `/api/pms/categories` | GET | 234 |
| `/api/pms/categories` | POST | 238 |
| `/api/pms/categories/:id` | PUT | 248 |
| `/api/pms/categories/:id` | DELETE | 257 |
| `/api/pms/items` | GET | 265 |
| `/api/pms/items` | POST | 276 |
| `/api/dashboard/stats` | GET | 290 |
| `/api/fleet` | GET | 315 |
| `/api/fleet` | POST | 335 |
| `/api/fleet/:vessel_id` | PUT | 346 |
| `/api/sync/restore/:vessel_id` | GET | 357 |
| `/api/sync/import-from-vessel` | POST | 377 |
| `/api/fleet/:vessel_id/push-templates` | POST | 393 |
| `/api/logs/global` | GET | 429 |

## Key Supporting Files
| File | Purpose |
|------|---------|
| `shared/schema.sql` | Canonical database schema for both Mother and Child. |
| `shared/sync_util.js` | Utilities for data synchronization between nodes. |
| `mother/mother.db` | Local SQLite database for the HQ node. |
| `docs_canonical/SYSTEM_SPEC.md` | Functional requirements and business logic details. |

## Notes
- **Token Efficiency**: Check this map before opening any large file.
- **Mimic Mode**: HQ uses "Mimic Mode" to view vessel data (see `mother/src/App.tsx` L135).

## mother/src/App.tsx Function Map (~306 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 31 |
| `fetchVessels` | 43 |
| `fetchStats` | 54 |
| `handleSelectVessel` | 66 |
| `handleAddVessel` | 73 |
| `handlePushTemplates` | 96 |

## mother/server.js Route Map (~441 lines)
| Route / Method | Handler Function | Line |
|----------------|-----------------|------|
| `GET /api/sync/prepare/:vesselId` | → | 26 |
| `POST /api/sync/push-all` | → | 38 |
| `GET /api/sync/download/:vesselId/:index` | → | 55 |
| `GET /api/sms/categories` | → | 119 |
| `POST /api/sms/categories` | → | 123 |
| `PUT /api/sms/categories/:id` | → | 133 |
| `DELETE /api/sms/categories/:id` | → | 142 |
| `GET /api/sms/templates` | → | 151 |
| `POST /api/sms/templates` | → | 155 |
| `PUT /api/sms/templates/:id` | → | 165 |
| `DELETE /api/sms/templates/:id` | → | 175 |
| `POST /api/admin/bulk-upload` | → | 184 |
| `GET /api/pms/categories` | → | 234 |
| `POST /api/pms/categories` | → | 238 |
| `PUT /api/pms/categories/:id` | → | 248 |
| `DELETE /api/pms/categories/:id` | → | 257 |
| `GET /api/pms/items` | → | 265 |
| `POST /api/pms/items` | → | 276 |
| `GET /api/dashboard/stats` | → | 290 |
| `GET /api/fleet` | → | 315 |
| `POST /api/fleet` | → | 335 |
| `PUT /api/fleet/:vessel_id` | → | 346 |
| `GET /api/sync/restore/:vessel_id` | → | 357 |
| `POST /api/sync/import-from-vessel` | → | 377 |
| `POST /api/fleet/:vessel_id/push-templates` | → | 393 |
| `GET /api/logs/global` | → | 429 |

## child/src/App.tsx Function Map (~232 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 49 |
| `fetchData` | 63 |
| `handleLogin` | 73 |
| `handleLogout` | 84 |

## child/server.js Route Map (~174 lines)
| Route / Method | Handler Function | Line |
|----------------|-----------------|------|
| `POST /api/login` | → | 54 |
| `GET /api/templates` | → | 66 |
| `GET /api/pms/categories` | → | 71 |
| `GET /api/pms/items` | → | 75 |
| `POST /api/pms/complete` | → | 86 |
| `GET /api/documents` | → | 110 |
| `POST /api/documents` | → | 120 |
| `PUT /api/documents/:id` | → | 128 |
| `POST /api/sync/export` | → | 152 |
| `POST /api/sync/import` | → | 162 |

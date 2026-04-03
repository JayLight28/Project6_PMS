# REPOSITORY MAP — PROJECT6_PMS (v1.0.1)
<!-- Update on /dock: always — re-scan line numbers + version sync -->

Stack: React 19 + Express + SQLite

## Directory Layout
```text
.
├── ANTIGRAVITY.md
├── child/
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
├── mother/
│   ├── server.js (HQ Backend)
│   ├── src/
│   │   ├── App.tsx (HQ Frontend)
│   │   ├── components/
│   │   └── modules/
├── shared/
│   ├── schema.sql (DB Schema)
│   └── sync_util.js
└── docs_canonical/
```

## mother/src/App.tsx Function Map (~282 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 25 |
| `fetchVessels` | 37 |
| `fetchStats` | 48 |
| `handleSelectVessel` | 60 |
| `handleAddVessel` | 67 |
| `handlePushTemplates` | 90 |

## mother/server.js Route Map (~441 lines)
| Route | Method | Line |
|-------|--------|------|
| `/api/sync/prepare/:vesselId` | GET | 26 |
| `/api/sync/push-all` | POST | 38 |
| `/api/sync/download/:vesselId/:index` | GET | 55 |
| `/api/sms/categories` | GET | 119 |
| `/api/sms/categories` | POST | 123 |
| `/api/sms/categories/:id` | PUT | 133 |
| `/api/sms/categories/:id` | DELETE | 142 |
| `/api/sms/templates` | GET | 151 |
| `/api/sms/templates` | POST | 155 |
| `/api/sms/templates/:id` | PUT | 165 |
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

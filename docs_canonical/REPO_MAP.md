# REPOSITORY MAP — PROJECT6_PMS (v1.0.0)
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

## mother/src/App.tsx Function Map (~215 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 29 |
| `handleSelectVessel` | 40 |
| `handleAddVessel` | 47 |

## mother/server.js Route Map (~166 lines)
| Route | Method | Line |
|-------|--------|------|
| `/api/sms/categories` | GET | 61 |
| `/api/sms/categories` | POST | 65 |
| `/api/sms/categories/:id` | PUT | 74 |
| `/api/sms/categories/:id` | DELETE | 82 |
| `/api/sms/templates` | GET | 90 |
| `/api/sms/templates` | POST | 94 |
| `/api/sms/templates/:id` | PUT | 103 |
| `/api/sms/templates/:id` | DELETE | 112 |
| `/api/fleet` | GET | 122 |
| `/api/fleet` | POST | 126 |
| `/api/pms/global` | GET | 137 |
| `/api/pms/global` | POST | 141 |
| `/api/sms/templates` | GET | 149 |
| `/api/logs/global` | GET | 154 |

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

## mother/src/App.tsx Function Map (~215 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 29 |
| `handleSelectVessel` | 40 |
| `handleAddVessel` | 47 |

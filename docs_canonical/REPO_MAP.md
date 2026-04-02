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

## mother/server.js Route Map (~96 lines)
| Route | Method | Line |
|-------|--------|------|
| `/api/fleet` | GET | 52 |
| `/api/fleet` | POST | 56 |
| `/api/pms/global` | GET | 67 |
| `/api/pms/global` | POST | 71 |
| `/api/sms/templates` | GET | 79 |
| `/api/logs/global` | GET | 84 |

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

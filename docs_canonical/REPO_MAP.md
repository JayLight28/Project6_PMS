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

## mother/src/App.tsx Function Map (~251 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 23 |
| `fetchVessels` | 35 |
| `fetchStats` | 46 |
| `handleSelectVessel` | 58 |
| `handleAddVessel` | 65 |

## mother/server.js Route Map (~301 lines)
| Route | Method | Line |
|-------|--------|------|
| `/api/sync/prepare/:vesselId` | GET | 22 |
| `/api/sync/push-all` | POST | 34 |
| `/api/sync/download/:vesselId/:index` | GET | 51 |
| `/api/sms/categories` | GET | 115 |
| `/api/sms/categories` | POST | 119 |
| `/api/sms/categories/:id` | PUT | 128 |
| `/api/sms/categories/:id` | DELETE | 136 |
| `/api/sms/templates` | GET | 144 |
| `/api/sms/templates` | POST | 148 |
| `/api/sms/templates/:id` | PUT | 157 |
| `/api/sms/templates/:id` | DELETE | 166 |
| `/api/pms/categories` | GET | 176 |
| `/api/pms/categories` | POST | 180 |
| `/api/pms/categories/:id` | PUT | 189 |
| `/api/pms/categories/:id` | DELETE | 197 |
| `/api/pms/items` | GET | 204 |
| `/api/pms/items` | POST | 215 |
| `/api/dashboard/stats` | GET | 228 |
| `/api/fleet` | GET | 253 |
| `/api/fleet` | POST | 273 |
| `/api/logs/global` | GET | 289 |

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

## mother/src/App.tsx Function Map (~251 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 23 |
| `fetchVessels` | 35 |
| `fetchStats` | 46 |
| `handleSelectVessel` | 58 |
| `handleAddVessel` | 65 |

## mother/src/App.tsx Function Map (~251 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 23 |
| `fetchVessels` | 35 |
| `fetchStats` | 46 |
| `handleSelectVessel` | 58 |
| `handleAddVessel` | 65 |

## mother/src/App.tsx Function Map (~251 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 23 |
| `fetchVessels` | 35 |
| `fetchStats` | 46 |
| `handleSelectVessel` | 58 |
| `handleAddVessel` | 65 |

## mother/server.js Route Map (~301 lines)
| Route | Method | Line |
|-------|--------|------|
| `/api/sync/prepare/:vesselId` | GET | 22 |
| `/api/sync/push-all` | POST | 34 |
| `/api/sync/download/:vesselId/:index` | GET | 51 |
| `/api/sms/categories` | GET | 115 |
| `/api/sms/categories` | POST | 119 |
| `/api/sms/categories/:id` | PUT | 128 |
| `/api/sms/categories/:id` | DELETE | 136 |
| `/api/sms/templates` | GET | 144 |
| `/api/sms/templates` | POST | 148 |
| `/api/sms/templates/:id` | PUT | 157 |
| `/api/sms/templates/:id` | DELETE | 166 |
| `/api/pms/categories` | GET | 176 |
| `/api/pms/categories` | POST | 180 |
| `/api/pms/categories/:id` | PUT | 189 |
| `/api/pms/categories/:id` | DELETE | 197 |
| `/api/pms/items` | GET | 204 |
| `/api/pms/items` | POST | 215 |
| `/api/dashboard/stats` | GET | 228 |
| `/api/fleet` | GET | 253 |
| `/api/fleet` | POST | 273 |
| `/api/logs/global` | GET | 289 |

## mother/src/App.tsx Function Map (~251 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 23 |
| `fetchVessels` | 35 |
| `fetchStats` | 46 |
| `handleSelectVessel` | 58 |
| `handleAddVessel` | 65 |

## mother/server.js Route Map (~301 lines)
| Route | Method | Line |
|-------|--------|------|
| `/api/sync/prepare/:vesselId` | GET | 22 |
| `/api/sync/push-all` | POST | 34 |
| `/api/sync/download/:vesselId/:index` | GET | 51 |
| `/api/sms/categories` | GET | 115 |
| `/api/sms/categories` | POST | 119 |
| `/api/sms/categories/:id` | PUT | 128 |
| `/api/sms/categories/:id` | DELETE | 136 |
| `/api/sms/templates` | GET | 144 |
| `/api/sms/templates` | POST | 148 |
| `/api/sms/templates/:id` | PUT | 157 |
| `/api/sms/templates/:id` | DELETE | 166 |
| `/api/pms/categories` | GET | 176 |
| `/api/pms/categories` | POST | 180 |
| `/api/pms/categories/:id` | PUT | 189 |
| `/api/pms/categories/:id` | DELETE | 197 |
| `/api/pms/items` | GET | 204 |
| `/api/pms/items` | POST | 215 |
| `/api/dashboard/stats` | GET | 228 |
| `/api/fleet` | GET | 253 |
| `/api/fleet` | POST | 273 |
| `/api/logs/global` | GET | 289 |

## mother/src/App.tsx Function Map (~251 lines)
| Handler / Function | Line |
|--------------------|------|
| `App` | 23 |
| `fetchVessels` | 35 |
| `fetchStats` | 46 |
| `handleSelectVessel` | 58 |
| `handleAddVessel` | 65 |

## mother/server.js Route Map (~301 lines)
| Route | Method | Line |
|-------|--------|------|
| `/api/sync/prepare/:vesselId` | GET | 22 |
| `/api/sync/push-all` | POST | 34 |
| `/api/sync/download/:vesselId/:index` | GET | 51 |
| `/api/sms/categories` | GET | 115 |
| `/api/sms/categories` | POST | 119 |
| `/api/sms/categories/:id` | PUT | 128 |
| `/api/sms/categories/:id` | DELETE | 136 |
| `/api/sms/templates` | GET | 144 |
| `/api/sms/templates` | POST | 148 |
| `/api/sms/templates/:id` | PUT | 157 |
| `/api/sms/templates/:id` | DELETE | 166 |
| `/api/pms/categories` | GET | 176 |
| `/api/pms/categories` | POST | 180 |
| `/api/pms/categories/:id` | PUT | 189 |
| `/api/pms/categories/:id` | DELETE | 197 |
| `/api/pms/items` | GET | 204 |
| `/api/pms/items` | POST | 215 |
| `/api/dashboard/stats` | GET | 228 |
| `/api/fleet` | GET | 253 |
| `/api/fleet` | POST | 273 |
| `/api/logs/global` | GET | 289 |

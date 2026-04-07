# STYLEGUIDE — PROJECT6_PMS (v1.1.0)
<!-- Update on /dock: only if a new convention was introduced. Skip otherwise. -->

## UI Design Tokens (Glassmorphism)
The project uses a premium, dark-mode glassmorphism aesthetic. All colors and spacing are managed via CSS variables in `mother/src/index.css`.

### Colors & Hierarchy
| Token | Value | Purpose |
|-------|-------|---------|
| `--primary` | `#0f172a` | Main surfaces (Sidebar). |
| `--accent` | `#38bdf8` | Action items, active states. |
| `--bg` | `#020617` | Deep background. |
| `--glass` | `rgba(15, 23, 42, 0.6)` | Semi-transparent overlays. |
| `--success` | `#10b981` | Positive status. |
| `--danger` | `#ef4444` | Alerts/Errors. |

### Typography
- **Headings**: `Outfit`, sans-serif (800/600 weight).
- **Body**: `Inter`, system-ui, sans-serif.

## CSS Component Classes
- `.glass-card`: Standard container with backdrop blur and subtle border.
- `.table-glass`: High-density table for listing many records.
- `.btn`: Primary action button with lift effect.
- `.btn-secondary`: Ghost button for neutral actions.

---

## Coding Patterns

### React 19 (Frontend)
- **Functional Components**: Use `const Component = () => { ... }`.
- **Hooks**: Prefer `useState` and `useEffect` for local lifecycle.
- **State Management**: Prop drilling for small depths; considering context/Redux for future global state (Sync progress).
- **Naming**: `handle[Action]` for event handlers (e.g., `handleSelectVessel`).

### Express 5 (Backend)
- **Middleware**: Use `logAction` for all state-changing requests (INSERT/UPDATE/DELETE).
- **Status Codes**: 
  - `200 OK` for success.
  - `400 Bad Request` for validation/logic errors.
  - `500 Internal Server Error` for DB failures.
- **SQLite Transactions**: Use `db.transaction()` for batch operations (like seeding).

### General Rules
- **No inline fetch**: All API calls should eventually be moved to a `services/` layer.
- **No `any` with TS**: Maintain strict typing for domain models (Vessel, Template, etc.).
- **Minimal Dependencies**: Before adding a new npm package, check if a lightweight alternative or native JS exists.

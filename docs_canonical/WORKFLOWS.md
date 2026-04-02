# WORKFLOWS — PROJECT6_PMS (v1.0.0)
<!-- Update on /dock: only if build/deploy process changed. Skip otherwise. -->

## Development Lifecycle
- **Authoring**: All code must reside on the local macOS (`JayLight-MacPro`).
- **Testing**: Frontend is tested via Vite's HMR; Backend is tested via `node server.js`.
- **Sync Validation**: Ensure `mother.db` and the Vessel node (when simulated) remain schema-consistent.

## Session Commands (Agent Standards)
### `/dock` — End of Session
1. **Version Sync**: Check `package.json` version and update all `@vX.X.X` headers in canonical docs.
2. **REPO_MAP update**: Re-scan line numbers for `mother/src/App.tsx` and `mother/server.js`.
3. **Canonical updates**: (Conditional)
   - `ARCHITECTURE.md` → if new API/sync logic added.
   - `STYLEGUIDE.md` → if new CSS token or coding pattern added.
   - `WORKFLOWS.md` → if build/deploy process changed.
4. **Git**: `git add . && git commit -m "..." && git push`.

### `/survey` — Integrity Scan
1. **Types**: Run `npx tsc --noEmit` in `mother` and `child`.
2. **Audit Check**: Verify every state-changing route in `server.js` calls `logAction`.
3. **Schema Check**: Ensure `shared/schema.sql` matches the live `mother.db` SQLite structure.

## Deployment & Distribution
- **Mother**: Deploy to HQ Windows Server (mimicked in dev).
- **Child**: Packaged as a lightweight Vite build for vessel-side deployment.
- **SQLite**: Database migrations are handled via `shared/schema.sql` execution on startup in `server.js`.

## Build Procedures
```bash
# Mother HQ
cd mother
npm run build

# Child Vessel
cd child
npm run build
```

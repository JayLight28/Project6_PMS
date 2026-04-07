# WORKFLOWS — PROJECT6_PMS (v1.1.0)
<!-- Update on /dock: only if build/deploy process changed. Skip otherwise. -->

## Development Lifecycle
- **Authoring**: All code must reside on the local macOS (`JayLight-MacPro`).
- **Testing**: Frontend is tested via Vite's HMR; Backend is tested via `node server.js`.
- **Sync Validation**: Ensure `mother.db` and the Vessel node (when simulated) remain schema-consistent.

## Session Commands (Agent Standards)
### `/dock` — Version Up & Sync
1. **Version Up**: Increment version in `package.json` and update all canonical headers.
2. **Update Canonical**: Re-scan line numbers for `REPO_MAP.md` and refresh `llms.txt`.
3. **Commit & Push**: `git add . && git commit -m "..." && git push`.

### `/survey` — Full System Audit
1. **Inspection**: Full code inspection for performance glitches and technical debt.
2. **Fixes**: Immediate glitch fixes, bug fixes, and logic optimization.
3. **Synchronization**: Check feature synchronization across Mother/Child nodes.
4. **Design**: Unify UI/UX design components for visual consistency.
5. **Integrity**: Full schema and audit log integrity checks.

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

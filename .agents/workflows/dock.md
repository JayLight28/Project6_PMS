---
description: Version Up & Sync Workflow — PROJECT6_PMS
---

1. **Version Update**
   - Increment version in `package.json`.
   - Update canonical headers (e.g., `REPO_MAP.md`, `WORKFLOWS.md`) to reflect the new version.
2. **Canonical Sync**
   - Re-scan all key files for line numbers and update `REPO_MAP.md`.
   - Refresh `llms.txt` and `llms-full.txt` using available tools.
3. **Commit & Push**
   - Stage all changes: `git add .`
   - Commit with message: `chore: /dock - version sync v[VERSION]`
   - Push to remote: `git push`

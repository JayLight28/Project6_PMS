---
description: Full System Audit & Integrity Check Workflow — PROJECT6_PMS
---

1. **System Inspection**
   - Perform a full code inspection for performance glitches and technical debt.
   - Scan for redundant documentation or hardcoded strings that should be constants.
2. **Glitch Fixes**
   - Apply immediate fixes for identified glitches and bugs.
   - Optimize logic and unify component structures where necessary.
3. **Synchronization Check**
   - Verify that feature and function sync between Mother (HQ) and Child (Vessel) nodes are consistent.
   - Check API consistency in `mother/server.js` and how they are consumed.
4. **UI Standardization**
   - Unify UI/UX design components for visual consistency.
   - Ensure HSL-based color tokens are utilized correctly across the project.
5. **Integrity Audit**
   - Perform full schema and audit log integrity checks.
   - Verify `shared/schema.sql` reflects the current database state.

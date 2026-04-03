# 🚢 Integrated Maritime Management System — PROJECT6_PMS (v1.0.1) Detailed Specification

This document provides the comprehensive technical and functional requirements for the SMS and PMS integrated platform.

---

## 1. System Philosophy & Architecture
The system operates on a **Mother-Child (Hub-and-Spoke)** model, designed for high reliability in low-bandwidth maritime environments.

### 1.1 Architecture Overview
- **Shared Core**: A common data schema and synchronization engine used by both Mother and Child applications.
- **Mother (HQ Hub)**: Central authority for configuration, fleet oversight, and master template management.
- **Child (Vessel Node)**: Local operational unit. Each vessel runs an independent instance with a local SQLite database to ensure 100% offline availability.

### 1.2 Tech Stack
- **Backend**: Node.js + Express + `better-sqlite3`.
- **Frontend**: React (Vite) + Vanilla CSS (Premium Maritime Design).
- **Document Engine**: `docx-templates` (Word) and `exceljs` (Excel) for high-fidelity form filling.
- **Sync Engine**: `archiver` & `unzipper` for Delta-based ZIP packaging.

---

## 2. SMS (Safety Management System) Module

### 2.1 Document Life Cycle
1. **Creation**: Users select a template (synced from Mother) and fill a web-based form.
2. **Draft State**: Documents can be saved as drafts locally.
3. **Completion**: Once "Completed", the document is timestamped and recorded in the audit log.
4. **Revision Control (Strict Logic)**:
    - **1st Edit**: The author can edit the completed document once without restriction.
    - **2nd Edit+**: The "Edit" button is locked. Only the **Child Master Admin** can unlock it by providing a **Mandatory Modification Reason**. 
    - All revisions create a new version entry in the `audit_logs`.

### 2.2 Template Management
- Mother HQ defines the "Master Form" (Word/Excel).
- Fields in the form are mapped to JSON metadata (e.g., `{{title}}`, `{{crew_name}}`).

---

## 3. PMS (Planned Maintenance System) Module

### 3.1 Maintenance Inventory
- **Global Items**: 100+ standard maintenance tasks (e.g., "Main Engine Monthly Check") pre-loaded from Mother.
- **Ship-Specific Items**: Child Master Admin can add local items (e.g., "Custom Deck Crane Inspection").

### 3.2 Scheduling Engine
- **Interval Management**: Tasks are set with intervals (e.g., 1 month, 3 months, 12,000 hours).
- **Notification Logic**:
    - **Status: Normal** (> 15 days to due).
    - **Status: Pre-Due** (7-15 days to due) - Highlighted in Yellow.
    - **Status: Overdue** (< 0 days) - Highlighted in Red.
- **Recurrence Logic**: Upon completion, `Next_Due_Date = Done_Date + Interval`.

---

## 4. Advanced System Integration (PMS-SMS-Cert)

### 4.1 Mandatory Linkage Workflow
To ensure safety compliance, specific PMS items are "Hard-Linked" to SMS documents.
1. User starts a **PMS Task** (e.g., "Lifeboat Engine Test").
2. System detects a linked SMS form (e.g., "Lifeboat Weekly Checklist").
3. **Hard-Lock**: The 'Complete PMS' button is disabled until the linked SMS form is marked 'Completed'.
4. User completes the SMS form -> PMS task is unlocked.

### 4.2 Certificate (Cert) Issuance
Upon successful completion of a linked PMS-SMS task, an **official Certificate** is generated.
- **Dual Digital Signatures**:
    - User's Signature: Inserted automatically from their profile.
    - Master Admin's Signature: Requires the Master to review and "Sign-off" the task.
- **Output**: A branded PDF or Word document containing both signatures and timestamped verification data.

---

## 5. Synchronization & Delta Logic (Crucial for AI Implementation)

### 5.1 Communication Strategy (Email Only)
Due to severe bandwidth limitations on satellite networks (VSAT/Starlink/FBB), the system strictly uses **Asynchronous Email-Based Synchronization**. There is zero direct TCP/IP API communication between Mother (HQ) and Child (Vessel).

### 5.2 Delta Extraction & Sync Packaging Process
When a user clicks "Export Sync Data", the system executes the following algorithm:
1. **Delta Query**: Query all core tables (`documents`, `maintenance_history`, etc.) for records where `updated_at > last_sync_at`.
2. **JSON Generation**: Structure the changes into a strictly defined `delta.json`.
    ```json
    {
      "vessel_id": "V-1234",
      "timestamp": "2026-03-30T10:00:00Z",
      "data": {
         "documents": [{ "id": 1, "status": "Completed", "data_json": "{...}", "updated_at": "..." }],
         "attachments": ["photo1_hashed.jpg"]
      }
    }
    ```
3. **ZIP Archiving (`archiver`)**: Bundle `delta.json` and any referenced media files from the `/uploads` directory into a `.zip` file.
4. **File Naming**: Output file must be named uniquely, e.g., `[VESSEL_NAME]_HQ_Sync_YYYYMMDD_HHMM.sms_sync`.

### 5.3 Strict Size Limit & Chunking Logic (Max 3.5MB)
To guarantee the `.sms_sync` file can be attached to standard marine emails:
- The backend sync engine must calculate the cumulative size of the `delta.json` and attachments in memory.
- If the estimated uncompressed payload reaches ~3.0MB, it must split the export into multiple sequences (e.g., `Sync_Part1.sms_sync`, `Sync_Part2.sms_sync`).

### 5.4 Image Auto-Compression Logic (Client-Side)
To prevent generating large payloads in the first place, all photo uploads must be intercepted by the React frontend:
1. Use HTML5 `Canvas` and `FileReader` API.
2. Intercept the `<input type="file" accept="image/*" />`.
3. Downscale logic: Resize image bounding box to `MAX_WIDTH = 800px` or `MAX_HEIGHT = 800px`, maintaining aspect ratio.
4. Compression: Export using `canvas.toDataURL('image/jpeg', 0.7)` (70% quality).
5. Only transmit this compressed base64 payload to the Express backend. This guarantees images stay around 50KB~150KB.

### 5.5 Conflict Resolution
If both Mother and Child systems modify the same record (e.g., same document ID):
- The Sync ID must be parsed. The **Mother (HQ) timestamp always takes precedence**. The Child data is forcefully overwritten.

---

## 6. Offline Application Updates (Sneakernet)
Because there is no live connection, the system cannot use NPM, Git, or OTA updates. The "Self-Update" feature relies purely on local file drops.

### 6.1 Update Package Structure
HQ provides a pre-compiled `update.zip` containing:
- `server/` (Compiled Node.js Express backend)
- `client/dist/` (Compiled Vite React frontend)
- `package.json` & `public/`

### 6.2 `Updater.bat` Execution Sequence
The `Updater.bat` script located on the Child vessel's Desktop performs the following atomic operations (must be implemented perfectly in Windows Batch/PowerShell):
1. **Detect**: Check if `./_update/update.zip` exists. If not, exit.
2. **Stop Service**: Terminate the Node.js / PM2 server process (`taskkill /F /IM node.exe` or stop pm2).
3. **Database Protection**: Verify `./database/sqlite.db` exists and safely copy it to `./backup/sqlite_backup_YYYYMMDD.db`.
4. **Extract & Overwrite**: Use PowerShell (`Expand-Archive -Force`) to unzip `update.zip` over the root directory. **CRITICAL**: The SQLite `.db` file must NEVER be included in the `update.zip` to avoid overwriting production data.
5. **Restart Service**: Launch the new `server/index.js` and open the browser.

## 6. Security & Permissions
- **HQ Master**: Full access to all vessels and templates.
- **Vessel Master**: Full access to vessel data, signatures, and user management.
- **Vessel Crew**: Can create and fill forms; cannot edit system-level PMS tasks.

---

## 7. Edge Case Handling & System Resilience
To ensure decades of stability in disconnected maritime environments, the system implements the following defensive features.

### 7.1 Sync Payload Integrity (Checksum Validation)
- Every `.sms_sync` file must contain a `SHA-256` checksum within its header or filename.
- When the Child or Mother imports a sync file, the backend verifies the hash before extracting. If corruption is detected, the transaction aborts and prompts "Sync file corrupted. Please request re-transmission."

### 7.2 Template Versioning & Backward Compatibility
- Mother HQ can update Master Templates (e.g., Checklists v1 `->` v2).
- **Draft Protection**: If a crew member is editing a draft under v1, that document remains locked to v1.
- **New Generations**: Only subsequent "New Document" creations will utilize the newly synced v2 template. Version IDs are strictly tracked in the `documents` table.

### 7.3 Synchronization ACK (Acknowledgement) Loop
- When a Child vessel successfully imports Delta Sequence `#123` from HQ, it records this in its local DB.
- The next time the Child exports data to HQ, the `delta.json` includes `last_applied_hq_sync_id: 123`.
- HQ uses this ACK to mark the vessel's dashboard status as "Sync Confirmed" and prevents sending duplicate `#123` payloads in the future.

### 7.4 Master Override via PIN Verification
- While the Audit Log locks a document after 1 free edit, the Vessel Master can override this lock.
- **Security Constraint**: Simply clicking "Unlock" is insufficient. A modal MUST prompt the Master to physically enter their **6-digit distinct PIN** into the UI at the exact moment of unlocking, along with typing the "Mandatory Reason".

### 7.5 Automated Archiving & Pruning Policy (Configured by HQ)
- To prevent storage exhaustion on vessel hard drives over 5~10 years of use, an automated SQLite Pruning Worker runs weekly on the Child node.
- **HQ Admin Configuration**: Mother HQ dictates the retention policy (e.g., "Keep text metadata forever, but delete photos for closed PMS items older than 36 months").
- **Sync & Enforce**: This policy setting is synchronized from Mother to Child. The Child node will autonomously scan its `uploads/` dir and delete old image blobs according to the HQ's rules, preserving UI speed and disk space.

# 🛠 Implementation Plan: SMS + PMS Integrated Platform

This plan outlines the step-by-step phased approach for building the dual-application ecosystem.

---

## Phase 1: Database & Core Logic (Shared)
The foundation of the system is the shared database schema and utility functions.

### 1.1 Final Schema Refinement
Implemented in `shared/schema.sql`:
- **Table: `users`**: roles (Crew, Master, HQ), hashed passwords, `signature_blob`.
- **Table: `maintenance_items`**: `linked_template_id`, `next_due_date`, `is_global`, `interval_months`.
- **Table: `documents`**: `edit_count`, `version`, `data_json`, `status`.
- **Table: `maintenance_history`**: `associated_doc_id`, `cert_path`, `findings`.

### 1.2 Signature & Doc Utility
- Develop a shared Node.js module to handle Base64 signature injection into docx/xlsx templates.

---

## Phase 2: Mother (HQ) Development
Focuses on "Fleet Command" and "Master Content".

### 2.1 Backend (Express + SQLite)
- **Fleet Management API**: Register vessels, manage IMO numbers, track last sync.
- **Master Template API & Versioning**: Handle file uploads for `.docx`/`.xlsx` forms and increment Template Version IDs to ensure legacy docs don't break.
- **Global PMS Repository**: Seeding logic for 100+ standard maritime maintenance items.

### 2.2 Frontend (React + Vanilla CSS)
- **HQ Dashboard**: Real-time summary of fleet status. Track `last_applied_hq_sync_id` (ACKs) per vessel.
- **Template Mapper**: Visual UI to map database fields to template tokens.
- **Global Policy Settings**: UI for HQ Admins to set the "Media Archiving Retention Period" (e.g., Delete photos older than 3 years).

---

## Phase 3: Child (Vessel) Development
The operational heart of the system for deck and engine use.

### 3.1 Backend
- **PMS Scheduler Service**: Daily worker to identify upcoming/overdue tasks.
- **Storage Archiving Worker**: Weekly cron job that deletes old photo files from `/uploads` based on the retention period dictated by HQ via sync.
- **Compliance Middleware**: Validates that required SMS forms are 'Completed' before PMS sign-off.
- **Cert Issuance Service**: Finalizes document generation with dual-signature overlays.

### 3.2 Frontend
- **PMS Board**: High-contrast, easy-to-read list of maintenance tasks with color-coded status.
- **Author-Locked Form Editor**: Logic for "1-edit free, 2-edit master-only".
- **Master PIN Modal**: A strict UI prompt requiring the Master's 6-digit PIN before unlocking any locked document.
- **Signature Canvas**: Modal for capturing hand-drawn signatures on touch devices.

---

## Phase 4: Sync Engine & Packaging (Offline Based)
Building the bridge between ship and shore for email-only communication. Any AI Agent working on this phase must STRICTLY follow these technical modules.

### 4.1 Sync Logic: Export & Chunking Module
- **Task**: Create an Express endpoint `POST /api/sync/export`.
- **Logic**: 
    1. Query SQLite: `SELECT * FROM table WHERE updated_at > last_sync_at`.
    2. Write records to a temporary `delta.json`. Append the latest Sync ID ACK.
    3. Use `archiver` npm package. Calculate file sizes dynamically. If payload > 3.0MB, close the zip stream and start `Part2.zip`.
    4. Generate SHA-256 Checksum for the ZIP file and append it to the filename.
    5. Rename `.zip` to `.sms_sync` and return the file buffer to the frontend.

### 4.2 Sync Logic: Import Module
- **Task**: Create an Express endpoint `POST /api/sync/import` configured with `multer`.
- **Logic**:
    1. Read filename or header. Verify SHA-256 Checksum against the payload. Abort if hash mismatch.
    2. Unzip the file to a `temp_import` directory. Parse `delta.json`.
    3. Begin a SQLite Transaction (`db.transaction()`).
    4. Execute `INSERT OR REPLACE INTO...` for every record. Only replace if the incoming `updated_at` is newer. Commit transaction.

### 4.3 Mandatory Client-Side Image Compression
- **Task**: Build a generic React Hook `useImageCompressor(file, maxWidth=800, quality=0.7)`.
- **Logic**: Use JavaScript `Image()` and `<canvas>` to draw the uploaded image, resize it mathematically, and output a Base64 JPEG string. The raw `File` object from the `<input>` must NEVER be sent directly to the backend.

### 4.4 Portable Distribution & `Updater.bat`
- **Task**: Write `Updater.bat` for Windows environments.
- **Logic**: The batch file must pause/kill node processes, run `xcopy` or `Expand-Archive` on the `update.zip` file dropped in the `_update/` folder, explicitly exclude the `/database/` folder during extraction to prevent data loss, and restart the app.

## Phase 5: Verification & Quality Assurance
1. **Linkage Workflow**: Verify PMS item 'A' cannot be closed without SMS form 'B'.
2. **Signature Fidelity**: Ensure signatures are clear and correctly positioned on the printed Cert.
3. **Offline Sync Test**: Verify data integrity after multiple export/import cycles across two instances.

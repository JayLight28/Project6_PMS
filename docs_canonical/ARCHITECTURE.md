# ARCHITECTURE — PROJECT6_PMS (v1.0.2)
<!-- Update on /dock: only if new view mode, API route, or data flow was added. Skip otherwise. -->

## System Overview
The Project6_PMS is a distributed maritime management system consisting of a central **Mother (HQ)** node and multiple **Child (Vessel)** nodes.

### Data Flow (Mimic & Sync)
1.  **Template Distribution**: HQ creates and updates SMS/PMS templates in `templates` and `maintenance_items` (where `is_global = 1`).
2.  **Vessel Operations**: Vessels pull these templates, perform local maintenance, and generate `documents` and `maintenance_history`.
3.  **Mimic Mode**: HQ pulls Vessel data into a local `mother.db` to "mimic" the vessel's current state for oversight without manual reporting.
4.  **Audit Trail**: All critical actions (edits, completions) are logged in `audit_logs` with a mandatory `edit_reason` for compliance.

## Database Schema (SQLite)
See `shared/schema.sql` for the canonical definitions.

### Core Tables
| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `categories` | Hierarchical tree (SMS/PMS). | Self-referencing `parent_id`. |
| `templates` | Docx/Xlsx form definitions. | `category_id` → `categories`. |
| `maintenance_items` | PMS tasks (Global or Local). | `linked_template_id` → `templates`. |
| `documents` | Completed SMS forms (JSON data). | `template_id` → `templates`. |
| `maintenance_history`| Proof of work & certification. | `item_id` → `maintenance_items`. |
| `vessels` | HQ registry of all ships. | Primary key for Mimic Mode sync. |
| `audit_logs` | Immutable record of all changes. | `user_id` → `users`. |

## Sync Strategy
- **Delta Sync**: Only modified records since `last_sync_at` are transferred.
- **Conflict Resolution**: HQ wins for global templates; Vessel wins for local maintenance records.
- **Security**: Future implementation will use `api_key` in the `vessels` table.

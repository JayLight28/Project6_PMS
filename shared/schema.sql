-- SMS & PMS Integrated Schema (SQLite)

-- Users (HQ and Vessel)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('master', 'user', 'hq_admin')) NOT NULL,
    signature_blob TEXT, -- Base64 encoded signature image
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hierarchical Tree Structure (Folders/Categories)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('sms', 'pms')) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_system BOOLEAN DEFAULT 0, -- Root categories (Manual, Procedure, etc.)
    FOREIGN KEY(parent_id) REFERENCES categories(id)
);

-- SMS Document Templates (Managed by Mother)
CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path to .docx or .xlsx template
    fields_json TEXT,         -- Mapping of web fields to template placeholders
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

-- PMS Maintenance Items (Managed by Mother/Child)
CREATE TABLE IF NOT EXISTS maintenance_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    interval_months INTEGER DEFAULT 3,
    last_done_date DATETIME,
    next_due_date DATETIME,
    is_global BOOLEAN DEFAULT 1, -- Items from Mother
    linked_template_id INTEGER,   -- Mandatory SMS form before completion
    requires_cert BOOLEAN DEFAULT 0, -- Issue certificate upon completion
    ship_id TEXT,                 -- For Mother to track which ship owns it
    status TEXT DEFAULT 'active',
    FOREIGN KEY(category_id) REFERENCES categories(id),
    FOREIGN KEY(linked_template_id) REFERENCES templates(id)
);

-- Completed SMS Documents
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    data_json TEXT NOT NULL,      -- Captured web form data
    author_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('draft', 'completed')) DEFAULT 'draft',
    edit_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(template_id) REFERENCES templates(id),
    FOREIGN KEY(author_id) REFERENCES users(id)
);

-- PMS Maintenance History & Certification
CREATE TABLE IF NOT EXISTS maintenance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    done_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    worker_id INTEGER NOT NULL,
    findings TEXT,
    associated_doc_id INTEGER,    -- Link to the mandatory SMS doc
    cert_path TEXT,               -- Path to generated Certificate
    next_due_date DATETIME,       -- Next expected date
    FOREIGN KEY(item_id) REFERENCES maintenance_items(id),
    FOREIGN KEY(worker_id) REFERENCES users(id),
    FOREIGN KEY(associated_doc_id) REFERENCES documents(id)
);

-- Global Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    action TEXT NOT NULL,         -- LOGIN, CREATE_DOC, EDIT_DOC, Pms_COMPLETE, etc.
    details TEXT,
    edit_reason TEXT,             -- Required for 2nd+ edits
    vessel_id TEXT,               -- For Mother to track origin
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Vessels (Mother Registry)
CREATE TABLE IF NOT EXISTS vessels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vessel_name TEXT UNIQUE NOT NULL,
    vessel_id TEXT UNIQUE NOT NULL, -- IMO Number
    api_key TEXT,                 -- For future secure sync
    last_sync_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

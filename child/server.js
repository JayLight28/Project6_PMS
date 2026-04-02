import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3002; // Different port for child
app.use(cors());
app.use(express.json());

// DB Initialization
const dbPath = path.join(__dirname, 'child.db');
const schemaPath = path.join(__dirname, '../shared/schema.sql');
const db = Database(dbPath);

const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Seed Master Admin if not exists
const masterUser = db.prepare('SELECT * FROM users WHERE role = "master"').get();
if (!masterUser) {
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
      .run('admin', 'admin123', 'master'); // Simple for demo
}

// Middleware for logging
const logAction = (userId, action, details) => {
    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(userId, action, details);
};

// --- API Endpoints ---

// Auth
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password_hash = ?').get(username, password);
    if (user) {
        logAction(user.id, 'LOGIN', 'User logged in');
        res.json(user);
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Templates (Synced from Mother)
app.get('/api/templates', (req, res) => {
    res.json(db.prepare('SELECT * FROM templates').all());
});

// Documents (Filled forms)
app.get('/api/documents', (req, res) => {
    res.json(db.prepare(`
        SELECT d.*, t.name as template_name, u.username as author_name 
        FROM documents d 
        JOIN templates t ON d.template_id = t.id 
        JOIN users u ON d.author_id = u.id 
        ORDER BY d.updated_at DESC
    `).all());
});

app.post('/api/documents', (req, res) => {
    const { template_id, title, data_json, author_id } = req.body;
    const stmt = db.prepare('INSERT INTO documents (template_id, title, data_json, author_id) VALUES (?, ?, ?, ?)');
    const info = stmt.run(template_id, title, JSON.stringify(data_json), author_id);
    logAction(author_id, 'CREATE_DOC', `Created document: ${title}`);
    res.json({ id: info.lastInsertRowid });
});

app.put('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    const { data_json, user_id, is_master, reason } = req.body;
    
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    // Business Logic: 2nd edit requires Master Admin + Reason
    if (doc.edit_count >= 1 && !is_master) {
        return res.status(403).json({ error: 'Subsequent edits require Master Admin approval' });
    }

    const stmt = db.prepare('UPDATE documents SET data_json = ?, edit_count = edit_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(JSON.stringify(data_json), id);
    
    logAction(user_id, 'EDIT_DOC', `Edited document ${id}. ${reason ? 'Reason: ' + reason : ''}`);
    res.json({ success: true });
});

import { exportSyncPack, importSyncPack } from '../shared/sync_util.js';

// Sync Logic
app.post('/api/sync/export', async (req, res) => {
    try {
        const packPath = path.join(__dirname, 'sync_child.zip');
        await exportSyncPack(db, 'CHILD_VESSEL_01', packPath);
        res.download(packPath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sync/import', async (req, res) => {
    try {
        const { packPath } = req.body;
        await importSyncPack(db, packPath);
        res.json({ message: "Sync complete" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Child Server running at http://localhost:${port}`);
});

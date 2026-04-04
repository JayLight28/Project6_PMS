import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { generateDocument } from '../shared/doc_generator.js';

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

// Seed Sample Data if empty
const seedData = () => {
    const masterUser = db.prepare('SELECT * FROM users WHERE role = "master"').get();
    if (!masterUser) {
        db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
          .run('master', '123456', 'master');
        db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
          .run('crew', '123456', 'user');
        console.log("Seeded default users (master/crew).");
    }

    const existingCats = db.prepare('SELECT count(*) as count FROM categories').get();
    if (existingCats.count === 0) {
        const insert = db.prepare('INSERT INTO categories (name, type, is_system) VALUES (?, ?, 1)');
        insert.run('DECK MACHINERY', 'pms');
        insert.run('ENGINE ROOM', 'pms');
        console.log("Seeded default child PMS categories.");
    }
};
seedData();

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
    res.json(db.prepare('SELECT * FROM templates WHERE is_active = 1').all());
});

// PMS Categories & Items
app.get('/api/pms/categories', (req, res) => {
    res.json(db.prepare('SELECT * FROM categories WHERE type = \'pms\' ORDER BY sort_order, id').all());
});

app.get('/api/pms/items', (req, res) => {
    const { category_id } = req.query;
    let query = 'SELECT * FROM maintenance_items';
    const params = [];
    if (category_id) {
        query += ' WHERE category_id = ?';
        params.push(category_id);
    }
    res.json(db.prepare(query).all(params));
});

app.post('/api/pms/complete', (req, res) => {
    const { item_id, worker_id, findings, associated_doc_id } = req.body;
    try {
        const stmt = db.prepare(`
            INSERT INTO maintenance_history (item_id, worker_id, findings, associated_doc_id) 
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(item_id, worker_id, findings, associated_doc_id);
        
        // Update last_done_date and calculate next_due_date
        const item = db.prepare('SELECT interval_months FROM maintenance_items WHERE id = ?').get(item_id);
        if (item) {
            const nextDue = new Date();
            nextDue.setMonth(nextDue.getMonth() + item.interval_months);
            db.prepare('UPDATE maintenance_items SET last_done_date = CURRENT_TIMESTAMP, next_due_date = ? WHERE id = ?')
              .run(nextDue.toISOString(), item_id);
        }

        logAction(worker_id, 'PMS_COMPLETE', `Completed maintenance item ${item_id}`);
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
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

app.get('/api/documents/:id/download', async (req, res) => {
    try {
        const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const tpl = db.prepare('SELECT * FROM templates WHERE id = ?').get(doc.template_id);
        if (!tpl) return res.status(404).json({ error: 'Template not found' });

        const uploadDir = path.join(__dirname, 'uploads');
        const templateFileName = tpl.file_path.split('/').pop();
        const templatePath = path.join(uploadDir, templateFileName);
        
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: `Physical template file not found: ${templateFileName}` });
        }

        const outDir = path.join(__dirname, 'generated');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        const exportExt = path.extname(templatePath);
        const outFileName = `Filled_${doc.title.replace(/\s+/g, '_')}${exportExt}`;
        const outPath = path.join(outDir, outFileName);

        const data = JSON.parse(doc.data_json);
        const metadata = JSON.parse(tpl.fields_json || '[]');

        await generateDocument(templatePath, outPath, data, metadata);
        
        res.download(outPath, outFileName);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

import pkgSync from '../shared/sync_util.js';
const { exportSyncPack, importSyncPack } = pkgSync;


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

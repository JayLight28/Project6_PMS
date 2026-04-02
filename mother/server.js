import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

// DB Initialization
const dbPath = path.join(__dirname, 'mother.db');
const schemaPath = path.join(__dirname, '../shared/schema.sql');
const db = new Database(dbPath);

const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Seed 100+ Global Items (Sample Demo)
const existingItems = db.prepare('SELECT count(*) as count FROM maintenance_items WHERE is_global = 1').get();
if (existingItems.count === 0) {
    const insert = db.prepare('INSERT INTO maintenance_items (name, description, interval_months, is_global) VALUES (?, ?, ?, 1)');
    const items = [
        ['Main Engine Check', 'Primary propulsion unit inspection', 3],
        ['Auxiliary Engine #1', 'Power generation engine test', 3],
        ['Fire Pump Test', 'Mandatory safety equipment test', 1],
        ['Lifeboat Release Gear', 'Lowering and release mechanism check', 3],
        ['Emergency Generator', 'Load test and starting mechanism', 1],
        // ... imagine 100 more items here
    ];
    const transaction = db.transaction((data) => {
        for (const item of data) insert.run(item[0], item[1], item[2]);
    });
    transaction(items);
    console.log("Seeded global PMS items.");
}

// Seed SMS Categories
const existingSmsCats = db.prepare('SELECT count(*) as count FROM categories WHERE type = "sms"').get();
if (existingSmsCats.count === 0) {
    const insert = db.prepare('INSERT INTO categories (name, type, is_system) VALUES (?, "sms", 1)');
    const cats = ['1. Main Manual', '2. Procedures', '3. Checklists', '4. Instructions'];
    db.transaction(() => cats.forEach(cat => insert.run(cat)))();
    console.log("Seeded SMS categories.");
}

// Middleware for logging
const logAction = (userId, action, details, shipId = null) => {
    db.prepare('INSERT INTO audit_logs (user_id, action, details, vessel_id) VALUES (?, ?, ?, ?)')
      .run(userId, action, details, shipId);
};

// --- SMS Admin API ---

// 1. Categories
app.get('/api/sms/categories', (req, res) => {
    res.json(db.prepare('SELECT * FROM categories WHERE type = "sms" ORDER BY sort_order, id').all());
});

app.post('/api/sms/categories', (req, res) => {
  const { name, parent_id } = req.body;
  try {
      const stmt = db.prepare('INSERT INTO categories (name, parent_id, type) VALUES (?, ?, "sms")');
      const result = stmt.run(name, parent_id);
      res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/sms/categories/:id', (req, res) => {
  const { name } = req.body;
  try {
      db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, req.params.id);
      res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/sms/categories/:id', (req, res) => {
  try {
      db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
      res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 2. Templates
app.get('/api/sms/templates', (req, res) => {
    res.json(db.prepare('SELECT * FROM templates WHERE is_active = 1').all());
});

app.post('/api/sms/templates', (req, res) => {
    const { category_id, name, file_path, fields_json } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO templates (category_id, name, file_path, fields_json) VALUES (?, ?, ?, ?)');
        const result = stmt.run(category_id, name, file_path || 'uploads/' + name, JSON.stringify(fields_json || []));
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/sms/templates/:id', (req, res) => {
  const { name, fields_json } = req.body;
  try {
      db.prepare('UPDATE templates SET name = ?, fields_json = ? WHERE id = ?')
        .run(name, JSON.stringify(fields_json), req.params.id);
      res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/sms/templates/:id', (req, res) => {
  try {
      db.prepare('UPDATE templates SET is_active = 0 WHERE id = ?').run(req.params.id);
      res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Mother Dashboard API ---

// Vessels Registry
app.get('/api/fleet', (req, res) => {
    res.json(db.prepare('SELECT * FROM vessels').all());
});

app.post('/api/fleet', (req, res) => {
    const { vessel_name, vessel_id } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO vessels (vessel_name, vessel_id) VALUES (?, ?)');
        stmt.run(vessel_name, vessel_id);
        logAction(null, 'FLEET_REGISTER', `Registered vessel: ${vessel_name}`);
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Global PMS Items
app.get('/api/pms/global', (req, res) => {
    res.json(db.prepare('SELECT * FROM maintenance_items WHERE is_global = 1').all());
});

app.post('/api/pms/global', (req, res) => {
    const { name, description, interval_months, linked_template_id, requires_cert } = req.body;
    const stmt = db.prepare('INSERT INTO maintenance_items (name, description, interval_months, linked_template_id, requires_cert, is_global) VALUES (?, ?, ?, ?, ?, 1)');
    stmt.run(name, description, interval_months, linked_template_id, requires_cert);
    res.json({ success: true });
});

// SMS Templates (English)
app.get('/api/sms/templates', (req, res) => {
    res.json(db.prepare('SELECT * FROM templates WHERE is_active = 1').all());
});

// Global Audit Logs (Monitor across fleet)
app.get('/api/logs/global', (req, res) => {
    res.json(db.prepare(`
        SELECT l.*, v.vessel_name 
        FROM audit_logs l 
        LEFT JOIN vessels v ON l.vessel_id = v.vessel_id 
        ORDER BY l.timestamp DESC
    `).all());
});

// Start Server
app.listen(port, () => {
    console.log(`[MOTHER HQ] Listening on http://localhost:${port}`);
});

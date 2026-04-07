import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDatabase } from './db_init.js';
import pkg from '../shared/sync_util.js';
const { exportSyncPack, importSyncPack, exportTemplatePack, exportVesselSyncPack } = pkg;
import { syncTemplateStyle } from './template_sync.js';

import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
const db = initDatabase();
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Temporary storage for sync packs
const SYNC_DIR = path.join(process.cwd(), 'sync_packs');
if (!fs.existsSync(SYNC_DIR)) fs.mkdirSync(SYNC_DIR);

// [NEW] Sync Endpoints
app.get('/api/sync/prepare/:vesselId', async (req, res) => {
    try {
        const vesselId = req.params.vesselId.replace('IMO ', ''); // Clean ID
        const zipPath = path.join(SYNC_DIR, `sync_${vesselId}.zip`);
        const result = await exportSyncPack(db, vesselId, zipPath);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to prepare sync pack" });
    }
});

app.post('/api/sync/push-all', async (req, res) => {
    try {
        const vessels = db.prepare('SELECT vessel_id FROM vessels').all();
        const results = [];
        for (const v of vessels) {
            const vesselId = v.vessel_id.replace('IMO ', '');
            const zipPath = path.join(SYNC_DIR, `sync_${vesselId}.zip`);
            const res = await exportSyncPack(db, vesselId, zipPath);
            results.push({ vessel_id: v.vessel_id, ...res });
        }
        res.json({ success: true, processed: results.length, details: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Batch sync preparation failed" });
    }
});

app.get('/api/sync/download/:vesselId/:index', (req, res) => {
    const { vesselId, index } = req.params;
    const partPath = path.join(SYNC_DIR, `sync_${vesselId}.zip.part${index}`);
    if (fs.existsSync(partPath)) {
        res.download(partPath);
    } else {
        res.status(404).json({ error: "Chunk not found" });
    }
});

app.use(cors());
app.use(express.json());

// Seed Vessels (Sample Fleet)
const existingVessels = db.prepare('SELECT count(*) as count FROM vessels').get();
if (existingVessels.count === 0) {
    const insert = db.prepare('INSERT INTO vessels (vessel_name, vessel_id) VALUES (?, ?)');
    const vessels = [
        ['MV PACIFIC GLORY', 'IMO 9123456'],
        ['MV ATLANTIC STAR', 'IMO 9876543'],
        ['MV INDIAN PEARL', 'IMO 9523485'],
        ['MV ARCTIC FROST', 'IMO 9987231']
    ];
    db.transaction(() => vessels.forEach(v => insert.run(v[0], v[1])))();
    console.log("Seeded sample fleet vessels.");
}

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
const existingSmsCats = db.prepare('SELECT count(*) as count FROM categories WHERE type = \'sms\'').get();
if (existingSmsCats.count === 0) {
    const insert = db.prepare('INSERT INTO categories (name, type, is_system) VALUES (?, \'sms\', 1)');
    const cats = ['1. Main Manual', '2. Procedures', '3. Checklists', '4. Instructions'];
    db.transaction(() => cats.forEach(cat => insert.run(cat)))();
    console.log("Seeded SMS categories.");
}

// Middleware for logging
const logAction = (userId, action, details, shipId = null) => {
    db.prepare('INSERT INTO audit_logs (user_id, action, details, vessel_id) VALUES (?, ?, ?, ?)')
      .run(userId, action, details, shipId);
};

// Recursively collect all descendant category IDs (including the root)
const collectCategoryIds = (rootId) => {
    const ids = [rootId];
    const children = db.prepare('SELECT id FROM categories WHERE parent_id = ?').all(rootId);
    for (const child of children) ids.push(...collectCategoryIds(child.id));
    return ids;
};

// Delete a category and all its descendants + linked rows
const deleteCategoryTree = (rootId) => {
    const ids = collectCategoryIds(rootId);
    const placeholders = ids.map(() => '?').join(',');
    db.pragma('foreign_keys = OFF');
    try {
        db.transaction(() => {
            db.prepare(`UPDATE templates SET category_id = NULL WHERE category_id IN (${placeholders})`).run(...ids);
            db.prepare(`UPDATE maintenance_items SET category_id = NULL WHERE category_id IN (${placeholders})`).run(...ids);
            db.prepare(`DELETE FROM categories WHERE id IN (${placeholders})`).run(...ids);
        })();
    } finally {
        db.pragma('foreign_keys = ON');
    }
};

// --- SMS Admin API ---

// 1. Categories
app.get('/api/sms/categories', (req, res) => {
    res.json(db.prepare("SELECT * FROM categories WHERE type = 'sms' ORDER BY sort_order, id").all());
});

app.post('/api/sms/categories', (req, res) => {
  const { name, parent_id } = req.body;
  try {
      const stmt = db.prepare('INSERT INTO categories (name, parent_id, type) VALUES (?, ?, \'sms\')');
      const result = stmt.run(name, parent_id);
      logAction(null, 'SMS_CAT_CREATE', `Created SMS category: ${name}`);
      res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/sms/categories/:id', (req, res) => {
  const { name } = req.body;
  try {
      db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, req.params.id);
      logAction(null, 'SMS_CAT_UPDATE', `Updated SMS category ID: ${req.params.id} to ${name}`);
      res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/sms/categories/:id', (req, res) => {
  try {
      const cat = db.prepare('SELECT is_system FROM categories WHERE id = ?').get(req.params.id);
      if (!cat) return res.status(404).json({ error: 'Category not found' });
      if (cat.is_system) return res.status(403).json({ error: 'System categories cannot be deleted' });
      deleteCategoryTree(req.params.id);
      logAction(null, 'SMS_CAT_DELETE', `Deleted SMS category tree ID: ${req.params.id}`);
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
        logAction(null, 'SMS_TPL_CREATE', `Created template: ${name}`);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/sms/templates/:id', (req, res) => {
  const { name, fields_json } = req.body;
  try {
      db.prepare('UPDATE templates SET name = ?, fields_json = ? WHERE id = ?')
        .run(name, JSON.stringify(fields_json), req.params.id);
      logAction(null, 'SMS_TPL_UPDATE', `Updated template ID: ${req.params.id}`);
      res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 2.1 Sync Template Styling to File
app.post('/api/sms/templates/:id/sync-style', async (req, res) => {
    const { fields_json } = req.body;
    try {
        const tplId = req.params.id;
        const tpl = db.prepare('SELECT * FROM templates WHERE id = ?').get(tplId);
        if (!tpl) return res.status(404).json({ error: 'Template not found' });

        const absolutePath = path.join(__dirname, tpl.file_path);
        if (!fs.existsSync(absolutePath)) return res.status(404).json({ error: 'Physical file not found' });

        const fields = typeof fields_json === 'string' ? JSON.parse(fields_json) : fields_json;
        await syncTemplateStyle(absolutePath, fields);

        // Update DB too
        db.prepare('UPDATE templates SET fields_json = ? WHERE id = ?')
          .run(JSON.stringify(fields), tplId);

        logAction(null, 'SMS_TPL_SYNC_STYLE', `Synced style to file: ${tpl.name}`);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.delete('/api/sms/templates/:id', (req, res) => {
  try {
      db.prepare('UPDATE templates SET is_active = 0 WHERE id = ?').run(req.params.id);
      logAction(null, 'SMS_TPL_DEACTIVATE', `Deactivated template ID: ${req.params.id}`);
      res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 3. Bulk Folder Upload
app.post('/api/admin/bulk-upload', upload.array('files'), (req, res) => {
  const { paths: pathsJson, type = 'sms' } = req.body;
  if (!pathsJson) return res.status(400).json({ error: 'Missing paths metadata' });

  const paths = JSON.parse(pathsJson);
  const files = req.files;

  if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

  try {
      const getOrCreateCategory = (name, parentId, type) => {
          const existing = db.prepare('SELECT id FROM categories WHERE name = ? AND parent_id IS ? AND type = ?')
                            .get(name, parentId, type);
          if (existing) return existing.id;
          const result = db.prepare('INSERT INTO categories (name, parent_id, type) VALUES (?, ?, ?)')
                          .run(name, parentId, type);
          return result.lastInsertRowid;
      };

      db.transaction(() => {
          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const relativePath = paths[i]; // e.g. "Folder/Sub/file.pdf"
              const segments = relativePath.split('/').filter(s => s);
              const fileName = segments.pop();

              let currentParentId = null;
              for (const segment of segments) {
                  currentParentId = getOrCreateCategory(segment, currentParentId, type);
              }

              // Multer already saved the file as uploads/[filename]
              const finalPath = `uploads/${file.filename}`;
              
              db.prepare('INSERT INTO templates (category_id, name, file_path) VALUES (?, ?, ?)')
                .run(currentParentId, fileName, finalPath);
          }
      })();

      logAction(null, 'BULK_UPLOAD', `Uploaded ${files.length} files as ${type}`);
      res.json({ success: true, count: files.length });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
  }
});

// --- Mother Dashboard API ---

// PMS Admin (Global Items & Categories)
app.get('/api/pms/categories', (req, res) => {
    res.json(db.prepare('SELECT * FROM categories WHERE type = \'pms\' ORDER BY sort_order, id').all());
});

app.post('/api/pms/categories', (req, res) => {
    const { name, parent_id } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO categories (name, parent_id, type) VALUES (?, ?, \'pms\')');
        const result = stmt.run(name, parent_id);
        logAction(null, 'PMS_CAT_CREATE', `Created PMS category: ${name}`);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/pms/categories/:id', (req, res) => {
    const { name } = req.body;
    try {
        db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, req.params.id);
        logAction(null, 'PMS_CAT_UPDATE', `Updated PMS category ID: ${req.params.id} to ${name}`);
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/pms/categories/:id', (req, res) => {
    try {
        const cat = db.prepare('SELECT is_system FROM categories WHERE id = ?').get(req.params.id);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        if (cat.is_system) return res.status(403).json({ error: 'System categories cannot be deleted' });
        deleteCategoryTree(req.params.id);
        logAction(null, 'PMS_CAT_DELETE', `Deleted PMS category tree ID: ${req.params.id}`);
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/pms/items', (req, res) => {
    const { category_id } = req.query;
    let query = 'SELECT * FROM maintenance_items WHERE is_global = 1';
    const params = [];
    if (category_id) {
        query += ' AND category_id = ?';
        params.push(category_id);
    }
    res.json(db.prepare(query).all(params));
});

app.post('/api/pms/items', (req, res) => {
    const { category_id, name, description, interval_months, linked_template_id, requires_cert } = req.body;
    try {
        const stmt = db.prepare(`
            INSERT INTO maintenance_items (category_id, name, description, interval_months, linked_template_id, requires_cert, is_global) 
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `);
        const result = stmt.run(category_id, name, description, interval_months, linked_template_id, requires_cert);
        logAction(null, 'PMS_ITEM_CREATE', `Created global PMS item: ${name}`);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Dashboard Stats (Live Insights)
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const fleetSize = db.prepare('SELECT count(*) as count FROM vessels').get().count;
        const activeAlerts = db.prepare('SELECT count(*) as count FROM audit_logs WHERE action = "ALERT"').get().count;
        const pendingReviews = db.prepare('SELECT count(*) as count FROM documents WHERE status = "pending"').get().count;
        
        // Sync Health: % of vessels that synced in last 24h
        const syncedInLast24h = db.prepare(`
            SELECT count(*) as count FROM vessels 
            WHERE last_sync_at >= datetime('now', '-1 day')
        `).get().count;
        const syncHealth = fleetSize > 0 ? Math.round((syncedInLast24h / fleetSize) * 100) : 100;

        res.json({
            fleetSize,
            activeAlerts: activeAlerts + 14, // Mock extra for demo
            pendingReviews,
            syncHealth
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vessels Registry
app.get('/api/fleet', (req, res) => {
    const vessels = db.prepare('SELECT * FROM vessels').all();
    const fleetWithStatus = vessels.map(v => {
        // Count pending reports (signed but not reviewed)
        const pending = db.prepare('SELECT count(*) as count FROM documents WHERE vessel_id = ? AND status = "signed"').get(v.vessel_id).count;
        
        // Mock sync status logic
        const lastSync = v.last_sync_at ? new Date(v.last_sync_at) : null;
        const now = new Date();
        const isDelayed = !lastSync || (now.getTime() - lastSync.getTime() > 24 * 60 * 60 * 1000);
        
        return {
            ...v,
            pendingReports: pending,
            isSyncDelayed: isDelayed
        };
    });
    res.json(fleetWithStatus);
});

app.post('/api/fleet', (req, res) => {
    const { vessel_name, vessel_id, ip_address, port } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO vessels (vessel_name, vessel_id, ip_address, port) VALUES (?, ?, ?, ?)');
        stmt.run(vessel_name, vessel_id, ip_address, port || 3002);
        logAction(null, 'FLEET_REGISTER', `Registered vessel: ${vessel_name}`);
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Update vessel IP address and port for template push
app.put('/api/fleet/:vessel_id', (req, res) => {
    const { ip_address, port } = req.body;
    try {
        db.prepare('UPDATE vessels SET ip_address = ?, port = ? WHERE vessel_id = ?')
          .run(ip_address, port || 3002, req.params.vessel_id);
        logAction(null, 'FLEET_UPDATE', `Updated connectivity for vessel: ${req.params.vessel_id}`);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Restore a specific vessel's data from Mother's records
app.get('/api/sync/restore/:vessel_id', async (req, res) => {
    try {
        const vesselId = req.params.vessel_id;
        const packPath = path.join(__dirname, `uploads/restore_${vesselId}.zip`);
        
        // Ensure uploads/ directory exists
        const uploadDir = path.dirname(packPath);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        await exportVesselSyncPack(db, vesselId, packPath);
        res.download(packPath, (err) => {
            if (err) console.error("Download error:", err);
            if (fs.existsSync(packPath)) fs.unlinkSync(packPath);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Receive sync ZIP from a vessel -> auto-register vessel + import data
app.post('/api/sync/import-from-vessel', upload.single('syncpack'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const data = await importSyncPack(db, req.file.path);
        fs.unlinkSync(req.file.path);
        logAction(null, 'VESSEL_SYNC', `Sync received from vessel: ${data.vessel?.vessel_id}`);
        res.json({
            success: true,
            vessel_id: data.vessel?.vessel_id,
            vessel_name: data.vessel?.vessel_name,
            synced_docs: data.documents.length
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Push global SMS/PMS templates from Mother to a specific vessel
app.post('/api/fleet/:vessel_id/push-templates', async (req, res) => {
    try {
        const vessel = db.prepare('SELECT * FROM vessels WHERE vessel_id = ?').get(req.params.vessel_id);
        if (!vessel) return res.status(404).json({ error: 'Vessel not found' });
        if (!vessel.ip_address) return res.status(400).json({ error: 'Vessel IP not set. Use PUT /api/fleet/:vessel_id first.' });

        const packPath = path.join(__dirname, `uploads/template_push_${vessel.vessel_id}.zip`);
        
        // Ensure uploads/ directory exists
        const uploadDir = path.dirname(packPath);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        await exportTemplatePack(db, packPath);

        const FormData = (await import('form-data')).default;
        const form = new FormData();
        form.append('templatepack', fs.createReadStream(packPath));

        const response = await fetch(
            `http://${vessel.ip_address}:${vessel.port || 3002}/api/sync/import-templates`,
            { method: 'POST', body: form, headers: form.getHeaders() }
        );
        fs.unlinkSync(packPath);

        const result = await response.json();
        logAction(null, 'TEMPLATE_PUSH', `Templates pushed to vessel: ${vessel.vessel_id}`);
        res.json({ success: true, ...result });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Global PMS Items (Handled by /api/pms/items above)

// SMS Templates (Redirected for common logic)
// (Already handled by /api/sms/templates above)

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

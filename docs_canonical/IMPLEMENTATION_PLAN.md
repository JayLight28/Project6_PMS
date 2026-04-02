# Implementation Plan: SMS + PMS Integrated Platform
<!-- Checklist format. Each task is atomic. Check off as completed. -->

---

## Phase 1: Schema & Shared Utilities

### 1.1 shared/schema.sql

- [x] **Add `ip_address` and `port` columns to `vessels` table.**
  File: `shared/schema.sql`, line 98–105. Replace the vessels table definition:
  ```sql
  CREATE TABLE IF NOT EXISTS vessels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vessel_name TEXT UNIQUE NOT NULL,
      vessel_id TEXT UNIQUE NOT NULL,
      api_key TEXT,
      last_sync_at DATETIME,
      ip_address TEXT,
      port INTEGER DEFAULT 3002,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [x] **Add `app_config` table (Child-only: stores mother_url, vessel identity).**
  File: `shared/schema.sql`. Append after the vessels table (after line 105):
  ```sql
  CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

### 1.2 shared/sync_util.js

- [x] **Remove `shipId` parameter from `exportSyncPack`. Read vessel from db instead.**
  File: `shared/sync_util.js`, line 12. Change signature and add vessel query:
  ```js
  // Before: export const exportSyncPack = async (db, shipId, targetPath) => {
  export const exportSyncPack = async (db, targetPath) => {
      const vessel = db.prepare('SELECT * FROM vessels LIMIT 1').get();
      const shipId = vessel ? vessel.vessel_id : 'UNKNOWN';

      const docs = db.prepare('SELECT * FROM documents').all();
      const categories = db.prepare('SELECT * FROM categories').all();
      const items = db.prepare('SELECT * FROM maintenance_items').all();
      const logs = db.prepare('SELECT * FROM audit_logs').all();

      const syncData = {
          vessel,                   // <-- added
          shipId,
          timestamp: new Date().toISOString(),
          documents: docs,
          categories,
          items,
          logs: logs.filter(l => l.action !== 'LOGIN')
      };
      // ... rest of function unchanged
  ```

- [x] **Add vessel UPSERT to `importSyncPack` (so Mother auto-registers the vessel).**
  File: `shared/sync_util.js`, line 93. Inside `db.transaction(() => {`, add before the categories block:
  ```js
  // Vessel registration (only runs on Mother side)
  if (data.vessel) {
      db.prepare(`
          INSERT INTO vessels (vessel_id, vessel_name, last_sync_at)
          VALUES (?, ?, ?)
          ON CONFLICT(vessel_id) DO UPDATE SET
              vessel_name = excluded.vessel_name,
              last_sync_at = excluded.last_sync_at
      `).run(data.vessel.vessel_id, data.vessel.vessel_name, data.timestamp);
  }
  ```

- [x] **Add `exportTemplatePack` function (Mother -> Child: push global SMS/PMS).**
  File: `shared/sync_util.js`. Append after `importSyncPack` closing brace (after line 127):
  ```js
  export const exportTemplatePack = async (db, targetPath) => {
      const categories = db.prepare('SELECT * FROM categories').all();
      const templates = db.prepare('SELECT * FROM templates WHERE is_active = 1').all();
      const items = db.prepare('SELECT * FROM maintenance_items WHERE is_global = 1').all();

      const packData = { categories, templates, items, timestamp: new Date().toISOString() };
      const manifestJson = JSON.stringify(packData, null, 2);
      const checksum = crypto.createHash('sha256').update(manifestJson).digest('hex');

      const dir = path.dirname(targetPath);
      const manifestPath = path.join(dir, 'template_manifest.json');
      const metaPath = path.join(dir, 'template_meta.json');
      fs.writeFileSync(manifestPath, manifestJson);
      fs.writeFileSync(metaPath, JSON.stringify({ checksum, timestamp: packData.timestamp }));

      const output = fs.createWriteStream(targetPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      await new Promise((resolve, reject) => {
          output.on('close', resolve);
          archive.on('error', reject);
          archive.pipe(output);
          archive.file(manifestPath, { name: 'template_manifest.json' });
          archive.file(metaPath, { name: 'template_meta.json' });
          archive.finalize();
      });

      fs.unlinkSync(manifestPath);
      fs.unlinkSync(metaPath);
      return { path: targetPath };
  };
  ```

- [x] **Add `importTemplatePack` function (Child receives Mother's templates).**
  File: `shared/sync_util.js`. Append after `exportTemplatePack`:
  ```js
  export const importTemplatePack = async (db, packPath) => {
      const directory = await unzipper.Open.file(packPath);
      const manifestFile = directory.files.find(f => f.path === 'template_manifest.json');
      const metaFile = directory.files.find(f => f.path === 'template_meta.json');

      if (!manifestFile || !metaFile) throw new Error('Invalid template pack');

      const content = await manifestFile.buffer();
      const meta = JSON.parse((await metaFile.buffer()).toString());

      const calculatedChecksum = crypto.createHash('sha256').update(content).digest('hex');
      if (calculatedChecksum !== meta.checksum) throw new Error('Template pack checksum mismatch');

      const data = JSON.parse(content.toString());

      db.transaction(() => {
          const insertCat = db.prepare(`
              INSERT INTO categories (id, parent_id, name, type, sort_order, is_system)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET name = excluded.name, parent_id = excluded.parent_id
          `);
          for (const cat of data.categories) {
              insertCat.run(cat.id, cat.parent_id, cat.name, cat.type, cat.sort_order, cat.is_system);
          }

          const insertTpl = db.prepare(`
              INSERT INTO templates (id, category_id, name, file_path, fields_json, version, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  fields_json = excluded.fields_json,
                  version = excluded.version,
                  is_active = excluded.is_active
          `);
          for (const tpl of data.templates) {
              insertTpl.run(tpl.id, tpl.category_id, tpl.name, tpl.file_path, tpl.fields_json, tpl.version, tpl.is_active);
          }

          const insertItem = db.prepare(`
              INSERT INTO maintenance_items (id, category_id, name, description, interval_months, is_global, linked_template_id, requires_cert)
              VALUES (?, ?, ?, ?, ?, 1, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  description = excluded.description,
                  interval_months = excluded.interval_months
          `);
          for (const item of data.items) {
              insertItem.run(item.id, item.category_id, item.name, item.description, item.interval_months, item.linked_template_id, item.requires_cert);
          }
      })();

      return data;
  };
  ```

---

## Phase 2: Mother Backend — `mother/server.js`

- [x] **Add `multer` and `form-data` imports at top of file.**
  File: `mother/server.js`, after line 6 (after `import fs from 'fs';`):
  ```js
  import multer from 'multer';
  import { exportTemplatePack, importSyncPack } from '../shared/sync_util.js';

  const upload = multer({ dest: path.join(__dirname, 'uploads/') });
  ```

- [x] **Add `POST /api/sync/import-from-vessel` endpoint.**
  File: `mother/server.js`, after line 201 (after the `POST /api/fleet` block):
  ```js
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
  ```

- [x] **Add `POST /api/fleet/:vessel_id/push-templates` endpoint.**
  File: `mother/server.js`, after the import-from-vessel block:
  ```js
  // Push global SMS/PMS templates from Mother to a specific vessel
  app.post('/api/fleet/:vessel_id/push-templates', async (req, res) => {
      try {
          const vessel = db.prepare('SELECT * FROM vessels WHERE vessel_id = ?').get(req.params.vessel_id);
          if (!vessel) return res.status(404).json({ error: 'Vessel not found' });
          if (!vessel.ip_address) return res.status(400).json({ error: 'Vessel IP not set. Use PUT /api/fleet/:vessel_id first.' });

          const packPath = path.join(__dirname, `uploads/template_push_${vessel.vessel_id}.zip`);
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
  ```

- [x] **Add `PUT /api/fleet/:vessel_id` endpoint (set vessel IP + port).**
  File: `mother/server.js`, after the push-templates block:
  ```js
  // Update vessel IP address and port for template push
  app.put('/api/fleet/:vessel_id', (req, res) => {
      const { ip_address, port } = req.body;
      try {
          db.prepare('UPDATE vessels SET ip_address = ?, port = ? WHERE vessel_id = ?')
            .run(ip_address, port || 3002, req.params.vessel_id);
          res.json({ success: true });
      } catch (err) { res.status(500).json({ error: err.message }); }
  });
  ```

- [x] **Install new packages in mother/.**
  ```bash
  cd mother && npm install multer form-data
  ```

---

## Phase 3: Child Backend — `child/server.js`

- [ ] **Fix `POST /api/sync/export`: remove hardcoded vessel_id.**
  File: `child/server.js`, line 153. Change:
  ```js
  // Before
  await exportSyncPack(db, 'CHILD_VESSEL_01', packPath);

  // After
  await exportSyncPack(db, packPath);
  ```

- [ ] **Update import line for sync_util.**
  File: `child/server.js`, line 147. Change:
  ```js
  // Before
  import { exportSyncPack, importSyncPack } from '../shared/sync_util.js';

  // After
  import { exportSyncPack, importSyncPack, importTemplatePack } from '../shared/sync_util.js';
  ```

- [ ] **Add `multer` import and setup at top of file.**
  File: `child/server.js`, after line 6 (after `import fs from 'fs';`):
  ```js
  import multer from 'multer';
  const upload = multer({ dest: path.join(__dirname, 'uploads/') });
  ```

- [ ] **Add `GET /api/self` endpoint (returns vessel info + mother_url).**
  File: `child/server.js`, after line 49 (after `logAction` definition):
  ```js
  // Return this vessel's identity and Mother HQ config
  app.get('/api/self', (req, res) => {
      const vessel = db.prepare('SELECT * FROM vessels LIMIT 1').get();
      const motherConfig = db.prepare('SELECT value FROM app_config WHERE key = "mother_url"').get();
      res.json({
          vessel: vessel || null,
          mother_url: motherConfig ? motherConfig.value : null
      });
  });
  ```

- [ ] **Add `POST /api/self/initialize` endpoint (first-run setup).**
  File: `child/server.js`, after the `/api/self` block:
  ```js
  // Save vessel identity and Mother URL on first launch
  app.post('/api/self/initialize', (req, res) => {
      const { vessel_name, vessel_id, mother_url } = req.body;
      if (!vessel_name || !vessel_id || !mother_url) {
          return res.status(400).json({ error: 'vessel_name, vessel_id, and mother_url are required' });
      }
      try {
          db.prepare('INSERT INTO vessels (vessel_name, vessel_id) VALUES (?, ?)').run(vessel_name, vessel_id);
          db.prepare('INSERT OR REPLACE INTO app_config (key, value) VALUES ("mother_url", ?)').run(mother_url);
          res.json({ success: true });
      } catch (err) { res.status(400).json({ error: err.message }); }
  });
  ```

- [ ] **Add `POST /api/sync/initial` endpoint (send first sync to Mother).**
  File: `child/server.js`, after `/api/self/initialize` block:
  ```js
  // Package vessel data and send to Mother for registration
  app.post('/api/sync/initial', async (req, res) => {
      try {
          const config = db.prepare('SELECT value FROM app_config WHERE key = "mother_url"').get();
          if (!config) return res.status(400).json({ error: 'Mother URL not configured. Run /api/self/initialize first.' });

          const packPath = path.join(__dirname, 'sync_initial.zip');
          await exportSyncPack(db, packPath);

          const FormData = (await import('form-data')).default;
          const form = new FormData();
          form.append('syncpack', fs.createReadStream(packPath));

          const response = await fetch(`${config.value}/api/sync/import-from-vessel`, {
              method: 'POST',
              body: form,
              headers: form.getHeaders()
          });

          fs.unlinkSync(packPath);
          const result = await response.json();
          res.json({ success: true, ...result });
      } catch (err) { res.status(500).json({ error: err.message }); }
  });
  ```

- [ ] **Add `POST /api/sync/import-templates` endpoint (receive templates from Mother).**
  File: `child/server.js`, after `/api/sync/initial` block:
  ```js
  // Receive and import SMS/PMS template pack from Mother
  app.post('/api/sync/import-templates', upload.single('templatepack'), async (req, res) => {
      try {
          if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
          await importTemplatePack(db, req.file.path);
          fs.unlinkSync(req.file.path);
          res.json({ success: true });
      } catch (err) { res.status(500).json({ error: err.message }); }
  });
  ```

- [ ] **Add `POST /api/sync/restore-from-mother` (Full Recovery Sync).**
  File: `child/server.js`, after the import-templates block:
  ```js
  // Fetch ALL historical data for this vessel from Mother and apply it (Full Restore)
  app.post('/api/sync/restore-from-mother', async (req, res) => {
      try {
          const config = db.prepare('SELECT value FROM app_config WHERE key = "mother_url"').get();
          const vessel = db.prepare('SELECT vessel_id FROM vessels LIMIT 1').get();
          if (!config || !vessel) return res.status(400).json({ error: 'Vessel ID or Mother URL not set.' });

          const restoreUrl = `${config.value}/api/sync/restore/${vessel.vessel_id}`;
          const response = await fetch(restoreUrl);
          if (!response.ok) throw new Error('Failed to fetch restore pack from Mother');

          const packPath = path.join(__dirname, 'restore_pack.zip');
          const arrayBuffer = await response.arrayBuffer();
          fs.writeFileSync(packPath, Buffer.from(arrayBuffer));

          await importSyncPack(db, packPath);
          fs.unlinkSync(packPath);
          res.json({ success: true });
      } catch (err) { res.status(500).json({ error: err.message }); }
  });
  ```

- [ ] **Install new packages in child/.**
  ```bash
  cd child && npm install multer form-data
  ```

---

## Phase 4: Child Frontend

### 4.1 `child/src/components/SetupScreen.tsx` — New File

- [ ] **Create SetupScreen component.**
  ```tsx
  import { useState } from 'react';
  import { Anchor } from 'lucide-react';

  interface Props {
    onComplete: () => void;
  }

  export default function SetupScreen({ onComplete }: Props) {
    const [form, setForm] = useState({ vessel_name: '', vessel_id: '', mother_url: '' });
    const [status, setStatus] = useState<'idle' | 'saving' | 'syncing' | 'done' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (isRestore: boolean) => {
      if (!form.vessel_name || !form.vessel_id || !form.mother_url) {
        setError('All fields are required.');
        return;
      }
      try {
        setStatus('saving');
        const r1 = await fetch('http://localhost:3002/api/self/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (!r1.ok) throw new Error('Failed to save vessel info');

        setStatus('syncing');
        const endpoint = isRestore ? '/api/sync/restore-from-mother' : '/api/sync/initial';
        const r2 = await fetch(`http://localhost:3002${endpoint}`, { method: 'POST' });
        if (!r2.ok) throw new Error(isRestore ? 'Restore failed' : 'Initial sync failed');

        setStatus('done');
        setTimeout(onComplete, 1500);
      } catch (err: any) {
        setError(err.message);
        setStatus('error');
      }
    };

    const statusText: Record<string, string> = {
      idle: '',
      saving: 'Saving vessel info...',
      syncing: 'Connecting to Mother HQ...',
      done: 'Setup complete. Loading...',
      error: ''
    };

    return (
      <div className="login-screen" style={{
        background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
        display: 'flex', flexDirection: 'column', gap: '2rem'
      }}>
        <div style={{ textAlign: 'center' }} className="fade-in">
          <Anchor size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit' }}>VESSEL INITIAL SETUP</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>First-time configuration — required once</p>
        </div>

        <div className="glass-card fade-in" style={{ width: '420px', padding: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Vessel Name</label>
              <input placeholder="e.g. MV PACIFIC GLORY"
                value={form.vessel_name}
                onChange={e => setForm({ ...form, vessel_name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>IMO Number</label>
              <input placeholder="e.g. IMO 9123456"
                value={form.vessel_id}
                onChange={e => setForm({ ...form, vessel_id: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Mother HQ Address</label>
              <input placeholder="e.g. http://192.168.1.100:3001"
                value={form.mother_url}
                onChange={e => setForm({ ...form, mother_url: e.target.value })} />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</p>}
            {statusText[status] && <p style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{statusText[status]}</p>}
            {statusText[status] && <p style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{statusText[status]}</p>}
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn"
                onClick={() => handleSubmit(false)}
                disabled={status !== 'idle' && status !== 'error'}
                style={{ flex: 1 }}
              >
                {status === 'idle' || status === 'error' ? 'New Vessel Setup' : '...'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleSubmit(true)}
                disabled={status !== 'idle' && status !== 'error'}
                style={{ flex: 1 }}
              >
                {status === 'idle' || status === 'error' ? 'Restore Existing' : '...'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

### 4.2 `child/src/App.tsx` — Modifications

- [ ] **Import SetupScreen at top of file.**
  File: `child/src/App.tsx`, after line 20 (after Layout import):
  ```tsx
  import SetupScreen from './components/SetupScreen';
  ```

- [ ] **Add setup check state and useEffect.**
  File: `child/src/App.tsx`, after line 52 (after `const [logs, setLogs] = useState...`):
  ```tsx
  const [isSetupRequired, setIsSetupRequired] = useState<boolean | null>(null); // null = loading
  
  useEffect(() => {
    fetch('http://localhost:3002/api/self')
      .then(r => r.json())
      .then(data => setIsSetupRequired(!data.vessel))
      .catch(() => setIsSetupRequired(false));
  }, []);
  ```

- [ ] **Add early returns before login check.**
  File: `child/src/App.tsx`, before line 87 (before `if (!user)`):
  ```tsx
  if (isSetupRequired === null) return null; // loading
  if (isSetupRequired) return <SetupScreen onComplete={() => setIsSetupRequired(false)} />;
  ```

- [ ] **Fix hardcoded vessel info in settings view.**
  File: `child/src/App.tsx`, line 212–214. Replace hardcoded vessel info:
  ```tsx
  // Before
  <p style={{ color: 'var(--text-dim)' }}>Vessel ID: IMO 9123456</p>
  <p style={{ color: 'var(--text-dim)' }}>Owner: Fortune Fleet Ltd.</p>

  // After — add selfInfo state (fetch on mount) and display:
  // 1. Add state: const [selfInfo, setSelfInfo] = useState<any>(null);
  // 2. In existing fetchData(), add:
  //    const s = await fetch('http://localhost:3002/api/self').then(r => r.json());
  //    setSelfInfo(s);
  // 3. In settings view:
  <p style={{ color: 'var(--text-dim)' }}>Vessel Name: {selfInfo?.vessel?.vessel_name ?? '—'}</p>
  <p style={{ color: 'var(--text-dim)' }}>IMO Number: {selfInfo?.vessel?.vessel_id ?? '—'}</p>
  <p style={{ color: 'var(--text-dim)' }}>Mother HQ: {selfInfo?.mother_url ?? '—'}</p>
  ```

- [ ] **Wire sync button in sync view.**
  File: `child/src/App.tsx`, line 207 (the "Sync with Mother HQ" button):
  ```tsx
  // Add handler:
  const handleSync = async () => {
    const res = await fetch('http://localhost:3002/api/sync/export', { method: 'POST' });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sync_child.zip';
      a.click();
    }
  };

  // Change button:
  <button className="btn" style={{ marginTop: '2rem' }} onClick={handleSync}>
    Sync with Mother HQ
  </button>
  ```

---

## Phase 5: Mother Frontend — `mother/src/App.tsx`

- [x] **Add `ip_address` and `port` fields to the Add Vessel modal state.**
  File: `mother/src/App.tsx`, line 47:
  ```tsx
  // Before
  const [newVessel, setNewVessel] = useState({ vessel_name: '', vessel_id: '' });

  // After
  const [newVessel, setNewVessel] = useState({ vessel_name: '', vessel_id: '', ip_address: '', port: '3002' });
  ```

- [x] **Add IP and port fields to the modal form.**
  File: `mother/src/App.tsx`, after the IMO input block (around line 225):
  ```tsx
  <div>
    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Vessel IP Address</label>
    <input placeholder="e.g. 192.168.1.50"
      value={newVessel.ip_address}
      onChange={e => setNewVessel({...newVessel, ip_address: e.target.value})} />
  </div>
  <div>
    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Port (default: 3002)</label>
    <input placeholder="3002"
      value={newVessel.port}
      onChange={e => setNewVessel({...newVessel, port: e.target.value})} />
  </div>
  ```

- [x] **Update `handleAddVessel` to include ip_address and port.**
  File: `mother/src/App.tsx`, line 60 (inside handleAddVessel fetch body):
  ```tsx
  // Before
  body: JSON.stringify(newVessel)  // was { vessel_name, vessel_id }

  // After: already works since newVessel now includes ip_address and port.
  // But also add a PUT call after successful POST if ip_address is provided:
  if (resp.ok && newVessel.ip_address) {
    const added = await fetch('http://localhost:3001/api/fleet').then(r => r.json());
    const vessel = added.find((v: any) => v.vessel_id === newVessel.vessel_id);
    if (vessel) {
      await fetch(`http://localhost:3001/api/fleet/${vessel.vessel_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: newVessel.ip_address, port: parseInt(newVessel.port) })
      });
    }
  }
  ```

- [x] **Add `handlePushTemplates` function.**
  File: `mother/src/App.tsx`, after `handleAddVessel` function (around line 75):
  ```tsx
  const handlePushTemplates = async (vessel_id: string) => {
    if (!confirm(`Push all SMS/PMS templates to ${vessel_id}?`)) return;
    try {
      const res = await fetch(`http://localhost:3001/api/fleet/${vessel_id}/push-templates`, { method: 'POST' });
      const data = await res.json();
      alert(data.success ? 'Templates pushed successfully.' : `Error: ${data.error}`);
    } catch {
      alert('Failed to reach vessel. Check IP address and network.');
    }
  };
  ```

- [x] **Add "Push Templates" button to fleet table Actions column.**
  File: `mother/src/App.tsx`, line 144 (inside vessels.map, the Actions `<td>`):
  ```tsx
  // After the existing "Open Mimic" button:
  <button
    className="btn-secondary"
    style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}
    onClick={() => handlePushTemplates(v.vessel_id)}
  >
    Push Templates
  </button>
  ```

---

## Phase 6: Other Backend Features (Child)

- [ ] **PMS Scheduler**: Daily worker to flag overdue/upcoming maintenance items.
- [ ] **Storage Archiving Worker**: Weekly cron to delete old photos per HQ retention policy.
- [ ] **Compliance Middleware**: Block PMS sign-off if linked SMS form is not 'completed'.
- [ ] **Cert Issuance Service**: Generate dual-signature PDF on PMS completion.

## Phase 7: Other Frontend Features (Child)

- [ ] **PMS Board**: Color-coded task rows (overdue = red, due soon = yellow, ok = green).
- [ ] **Author-Locked Form Editor**: 1st edit free; 2nd edit requires Master role.
- [ ] **Master PIN Modal**: 6-digit PIN prompt before unlocking any locked document.
- [ ] **Signature Canvas**: Touch-friendly modal for hand-drawn signatures.
- [ ] **Image Compressor Hook**: `useImageCompressor(file, maxWidth=800, quality=0.7)` — resize via canvas before upload.

---

## Phase 8: Windows Packaging

- [ ] **Build Child frontend.**
  ```bash
  cd child && npm run build
  ```

- [ ] **Bundle Child server + Node runtime into single exe using `pkg`.**
  ```bash
  npm install -g pkg
  pkg child/server.js --target node18-win-x64 --output dist-win/child-server.exe
  ```

- [ ] **Write `Updater.bat`** for field updates (kills process, extracts update.zip, skips /database/ folder, restarts).

- [ ] **Create Inno Setup or NSIS script** pointing to:
  - `dist-win/child-server.exe`
  - `child/dist/` (frontend build)
  - Start menu shortcut + auto-start on login

---

## Verification Checklist

- [ ] Delete `child/child.db`, restart Child server — SetupScreen appears.
- [ ] Fill in vessel info + Mother URL — vessel appears in Mother fleet list automatically.
- [ ] In Mother, click "Push Templates" for new vessel — Child receives categories/templates/items.
- [ ] In Child, navigate to PMS — Mother's global items are visible.
- [ ] In Child, create a document — sync export ZIP downloads correctly.
- [ ] Import that ZIP into Mother (POST /api/sync/import-from-vessel) — document appears in Mimic Mode.
- [ ] Run `npm run build` in both mother/ and child/ — TypeScript errors must be zero.
- [ ] Install Child on clean Windows machine — runs without Node.js installed.

---

## Network Prerequisites

- Mother HQ and all 9 Child servers on same network or VPN.
- Child can reach `{mother_url}/api/*` (outbound from vessel).
- Mother can reach `http://{vessel.ip_address}:3002/api/*` (for Push Templates).
- Offline operation: Child runs locally; sync and template push run manually after reconnection.

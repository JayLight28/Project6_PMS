const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');
const crypto = require('crypto');


/**
 * Sync Utility for SMS Document Management
 * Handles exporting deltas to ZIP and importing them.
 */

const exportSyncPack = async (db, targetPath) => {

    // 1. Fetch vessel info for registration/tracking
    const vessel = db.prepare('SELECT * FROM vessels LIMIT 1').get();
    const shipId = vessel ? vessel.vessel_id : 'UNKNOWN';

    // 2. Fetch modified data
    const docs = db.prepare('SELECT * FROM documents').all();
    const categories = db.prepare('SELECT * FROM categories').all();
    const items = db.prepare('SELECT * FROM maintenance_items').all();
    const logs = db.prepare('SELECT * FROM audit_logs').all();
    
    const syncData = {
        vessel,
        shipId,
        timestamp: new Date().toISOString(),
        documents: docs,
        categories,
        items,
        logs: logs.filter(l => l.action !== 'LOGIN') // Filter noisy logs
    };

    // Calculate Checksum of manifest
    const manifestJson = JSON.stringify(syncData, null, 2);
    const checksum = crypto.createHash('sha256').update(manifestJson).digest('hex');
    
    const meta = { checksum, shipId, timestamp: syncData.timestamp };

    const manifestPath = path.join(path.dirname(targetPath), 'manifest.json');
    const metaPath = path.join(path.dirname(targetPath), 'meta.json');
    fs.writeFileSync(manifestPath, manifestJson);
    fs.writeFileSync(metaPath, JSON.stringify(meta));

    // 3. Zip it up
    const output = fs.createWriteStream(targetPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.file(manifestPath, { name: 'manifest.json' });
        archive.file(metaPath, { name: 'meta.json' });
        archive.finalize();
    });

    fs.unlinkSync(manifestPath);
    fs.unlinkSync(metaPath);

    // 4. Chunking (3.5MB limit)
    const stats = fs.statSync(targetPath);
    const CHUNK_SIZE = 3.5 * 1024 * 1024;
    
    if (stats.size > CHUNK_SIZE) {
        const buffer = fs.readFileSync(targetPath);
        const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
        for (let i = 0; i < totalChunks; i++) {
            const chunk = buffer.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            fs.writeFileSync(`${targetPath}.part${i + 1}`, chunk);
        }
        return { chunked: true, totalChunks, path: targetPath };
    }

    return { chunked: false, path: targetPath };
};

const importSyncPack = async (db, packPath) => {

    // 1. Unzip
    const directory = await unzipper.Open.file(packPath);
    const manifestFile = directory.files.find(f => f.path === 'manifest.json');
    const metaFile = directory.files.find(f => f.path === 'meta.json');
    
    if (!manifestFile || !metaFile) throw new Error("Invalid sync pack: manifest or meta missing");

    const content = await manifestFile.buffer();
    const metaContent = await metaFile.buffer();
    
    const data = JSON.parse(content.toString());
    const meta = JSON.parse(metaContent.toString());

    // 2. Integrity Check (SHA-256)
    const calculatedChecksum = crypto.createHash('sha256').update(content).digest('hex');
    if (calculatedChecksum !== meta.checksum) {
        throw new Error("Integrity Check Failed: Checksum mismatch");
    }

    // 3. Merge into DB (UPSERT logic)
    db.transaction(() => {
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

        // Categories
        const insertCat = db.prepare(`
            INSERT INTO categories (id, parent_id, name, type, sort_order, is_system) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, parent_id = excluded.parent_id
        `);
        for (const cat of data.categories) insertCat.run(cat.id, cat.parent_id, cat.name, cat.type, cat.sort_order, cat.is_system);

        // Maintenance Items
        const insertItem = db.prepare(`
            INSERT INTO maintenance_items (id, category_id, name, description, interval_months, last_done_date, next_due_date, is_global, linked_template_id, requires_cert, ship_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                name = excluded.name, 
                description = excluded.description, 
                next_due_date = excluded.next_due_date
        `);
        for (const item of data.items) insertItem.run(item.id, item.category_id, item.name, item.description, item.interval_months, item.last_done_date, item.next_due_date, item.is_global, item.linked_template_id, item.requires_cert, item.ship_id);

        // Documents
        const insertDoc = db.prepare(`
            INSERT INTO documents (id, template_id, vessel_id, title, data_json, author_id, status, edit_count, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                data_json = excluded.data_json, 
                status = excluded.status, 
                edit_count = excluded.edit_count, 
                updated_at = excluded.updated_at,
                vessel_id = excluded.vessel_id
        `);
        for (const doc of data.documents) {
            insertDoc.run(
                doc.id, 
                doc.template_id, 
                data.shipId || data.vessel?.vessel_id, // Use shipId from manifest
                doc.title, 
                doc.data_json, 
                doc.author_id, 
                doc.status, 
                doc.edit_count, 
                doc.updated_at
            );
        }
    })();

    return data;
};

const exportTemplatePack = async (db, targetPath) => {

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
        
        // Add physical files
        for (const tpl of templates) {
            const absPath = path.resolve(__dirname, '../mother', tpl.file_path);
            if (fs.existsSync(absPath)) {
                archive.file(absPath, { name: `files/${tpl.file_path.split('/').pop()}` });
            }
        }
        
        archive.finalize();
    });

    fs.unlinkSync(manifestPath);
    fs.unlinkSync(metaPath);
    return { path: targetPath };
};

const importTemplatePack = async (db, packPath) => {

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

    // 4. Extract physical files
    const uploadDir = path.join(path.dirname(db.name), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (const file of directory.files) {
        if (file.path.startsWith('files/')) {
            const fileName = file.path.split('/').pop();
            const destPath = path.join(uploadDir, fileName);
            const content = await file.buffer();
            fs.writeFileSync(destPath, content);
        }
    }

    return data;

    return data;
};

const reassembleSyncPack = async (partsPath, totalChunks, targetZipPath) => {

    const buffers = [];
    for (let i = 1; i <= totalChunks; i++) {
        const partPath = `${partsPath}.part${i}`;
        if (!fs.existsSync(partPath)) {
            throw new Error(`Missing chunk part: ${i}`);
        }
        buffers.push(fs.readFileSync(partPath));
    }
    const fullBuffer = Buffer.concat(buffers);
    fs.writeFileSync(targetZipPath, fullBuffer);
    
    // Cleanup parts
    for (let i = 1; i <= totalChunks; i++) {
        fs.unlinkSync(`${partsPath}.part${i}`);
    }
    
    return targetZipPath;
};
const exportVesselSyncPack = async (db, vesselId, targetPath) => {

    // 1. Fetch vessel data from Mother's database filtered by vessel_id
    const vessel = db.prepare('SELECT * FROM vessels WHERE vessel_id = ?').get(vesselId);
    if (!vessel) throw new Error(`Vessel not found: ${vesselId}`);

    const docs = db.prepare('SELECT * FROM documents WHERE vessel_id = ?').all(vesselId);
    const categories = db.prepare('SELECT * FROM categories').all(); // Send all categories for structure
    const items = db.prepare('SELECT * FROM maintenance_items WHERE ship_id = ? OR is_global = 1').all(vesselId);
    const logs = db.prepare('SELECT * FROM audit_logs WHERE vessel_id = ?').all(vesselId);

    const syncData = {
        vessel,
        shipId: vesselId,
        timestamp: new Date().toISOString(),
        documents: docs,
        categories,
        items,
        logs: logs.filter(l => l.action !== 'LOGIN')
    };

    const manifestJson = JSON.stringify(syncData, null, 2);
    const checksum = crypto.createHash('sha256').update(manifestJson).digest('hex');
    const meta = { checksum, shipId: vesselId, timestamp: syncData.timestamp };

    const dir = path.dirname(targetPath);
    const manifestPath = path.join(dir, 'manifest.json');
    const metaPath = path.join(dir, 'meta.json');
    fs.writeFileSync(manifestPath, manifestJson);
    fs.writeFileSync(metaPath, JSON.stringify(meta));

    const output = fs.createWriteStream(targetPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.file(manifestPath, { name: 'manifest.json' });
        archive.file(metaPath, { name: 'meta.json' });
        archive.finalize();
    });

    fs.unlinkSync(manifestPath);
    fs.unlinkSync(metaPath);
    return { path: targetPath };
};

module.exports = {
    exportSyncPack,
    importSyncPack,
    exportTemplatePack,
    importTemplatePack,
    reassembleSyncPack,
    exportVesselSyncPack
};

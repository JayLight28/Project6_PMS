import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import unzipper from 'unzipper';

/**
 * Sync Utility for SMS Document Management
 * Handles exporting deltas to ZIP and importing them.
 */

export const exportSyncPack = async (db, shipId, targetPath) => {
    // 1. Fetch modified data since last_sync_at (simplified: all docs for demo)
    const docs = db.prepare('SELECT * FROM documents').all();
    const logs = db.prepare('SELECT * FROM audit_logs WHERE system_log = 1').all();
    
    const syncData = {
        shipId,
        timestamp: new Date().toISOString(),
        documents: docs,
        logs: logs
    };

    const manifestPath = path.join(path.dirname(targetPath), 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(syncData, null, 2));

    // 2. Zip it up
    const output = fs.createWriteStream(targetPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
        output.on('close', () => {
            fs.unlinkSync(manifestPath);
            resolve(targetPath);
        });
        archive.on('error', reject);
        archive.pipe(output);
        archive.file(manifestPath, { name: 'manifest.json' });
        // Add files if any
        archive.finalize();
    });
};

export const importSyncPack = async (db, packPath) => {
    // 1. Unzip
    const directory = await unzipper.Open.file(packPath);
    const manifestFile = directory.files.find(f => f.path === 'manifest.json');
    if (!manifestFile) throw new Error("Invalid sync pack: manifest.json missing");

    const content = await manifestFile.buffer();
    const data = JSON.parse(content.toString());

    // 2. Merge into DB (UPSERT logic)
    const insertDoc = db.prepare(`
        INSERT INTO documents (id, template_id, title, data_json, author_id, status, edit_count, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET 
            data_json = excluded.data_json, 
            status = excluded.status, 
            edit_count = excluded.edit_count, 
            updated_at = excluded.updated_at
    `);

    const transaction = db.transaction((docs) => {
        for (const doc of docs) {
            insertDoc.run(doc.id, doc.template_id, doc.title, doc.data_json, doc.author_id, doc.status, doc.edit_count, doc.updated_at);
        }
    });

    transaction(data.documents);
    return data;
};

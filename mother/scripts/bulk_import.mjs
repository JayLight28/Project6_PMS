import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Bulk Import Script for SMS/PMS Documents
 * Usage: node scripts/bulk_import.js <target_directory> <type (sms/pms)>
 */

const TARGET_DIR = process.argv[2];
const TYPE = process.argv[3] || 'sms'; // Default to sms

if (!TARGET_DIR) {
    console.error('Usage: node scripts/bulk_import.js <target_directory> [sms/pms]');
    process.exit(1);
}

const DB_PATH = path.join(__dirname, '../mother.db');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found at ${DB_PATH}. Run mother server first to initialize.`);
    process.exit(1);
}

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

function getOrCreateCategory(name, parent_id = null) {
    const existing = db.prepare('SELECT id FROM categories WHERE name = ? AND parent_id IS ? AND type = ?')
                      .get(name, parent_id, TYPE);
    if (existing) return existing.id;

    const stmt = db.prepare('INSERT INTO categories (name, parent_id, type) VALUES (?, ?, ?)');
    const result = stmt.run(name, parent_id, TYPE);
    return result.lastInsertRowid;
}

function registerTemplate(categoryId, filePath) {
    const name = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Only support document types
    if (!['.docx', '.xlsx', '.pdf'].includes(ext)) return;

    // Standardize destination path
    const destName = `${Date.now()}_${name}`; // Avoid collisions
    const destPath = path.join(UPLOADS_DIR, destName);
    
    fs.copyFileSync(filePath, destPath);

    const stmt = db.prepare('INSERT INTO templates (category_id, name, file_path) VALUES (?, ?, ?)');
    stmt.run(categoryId, name, `uploads/${destName}`);
    console.log(`[TPL] Registered: ${name}`);
}

function scanDirectory(dir, parentId = null) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            console.log(`[CAT] Creating/Checking Category: ${entry.name}`);
            const categoryId = getOrCreateCategory(entry.name, parentId);
            scanDirectory(fullPath, categoryId);
        } else if (entry.isFile()) {
            if (parentId === null) {
                // Files in root of target dir - create a "Default" or "Root" category if needed
                // But usually we expect a folder structure. 
                // Let's create a "Root Files" category if parentId is null
                const rootCatId = getOrCreateCategory('Root Files', null);
                registerTemplate(rootCatId, fullPath);
            } else {
                registerTemplate(parentId, fullPath);
            }
        }
    }
}

console.log(`Starting bulk import from: ${TARGET_DIR}`);
try {
    db.transaction(() => {
        scanDirectory(TARGET_DIR);
    })();
    console.log('Bulk import completed successfully.');
} catch (err) {
    console.error('Import failed:', err);
} finally {
    db.close();
}

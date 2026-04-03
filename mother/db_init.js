import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initializes the Mother HQ database.
 * Connects to mother.db and applies the shared schema.
 */
export function initDatabase() {
    const dbPath = path.join(__dirname, 'mother.db');
    const db = new Database(dbPath);
    
    // Enable WAL mode for better performance and concurrency
    db.pragma('journal_mode = WAL');
    
    // Basic schema application from shared/schema.sql
    const schemaPath = path.join(__dirname, '../shared/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
    } else {
        console.warn('Warning: shared/schema.sql not found. Database might be incomplete.');
    }
    
    return db;
}

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const rows = db.prepare('SELECT id, title, slug, external_id FROM sections').all();
console.log(rows);

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const rows = db.prepare("SELECT id, url FROM files WHERE url LIKE 'api::%' LIMIT 5").all();
console.log(rows);

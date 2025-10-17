import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
if (!fs.existsSync(dbPath)) {
  console.error('Database not found at', dbPath);
  process.exit(1);
}
const db = new Database(dbPath, { readonly: true });
const rows = db.prepare('SELECT name, description, type FROM strapi_api_tokens').all();
console.log(rows);

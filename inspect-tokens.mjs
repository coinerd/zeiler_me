import Database from 'better-sqlite3';
import path from 'path';
const dbPath = path.join(process.cwd(), 'cms', '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const rows = db.prepare('SELECT name, type FROM strapi_api_tokens').all();
console.log(rows);

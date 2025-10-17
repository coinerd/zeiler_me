import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const rows = db.prepare('SELECT name, access_key FROM strapi_api_tokens').all();
console.log(rows.map((row) => ({ name: row.name, length: row.access_key?.length })));

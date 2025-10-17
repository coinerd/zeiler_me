import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const columns = db.prepare("PRAGMA table_info('strapi_api_tokens')").all();
console.log(columns);

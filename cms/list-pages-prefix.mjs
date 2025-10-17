import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'pages_%'")
  .all();
console.log(tables);

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const rows = db
  .prepare("SELECT name, sql FROM sqlite_master WHERE sql LIKE '%api::section.section%'")
  .all();
console.log(rows.map((row) => row.name));

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const duplicates = db
  .prepare(
    `SELECT slug, COUNT(*) as count
     FROM pages
     GROUP BY slug
     HAVING COUNT(*) > 1`
  )
  .all();
console.log(duplicates.slice(0, 10));

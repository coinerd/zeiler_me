import Database from 'better-sqlite3';
import path from 'path';

const cmsDir = process.cwd();
const dbPath = path.join(cmsDir, '.tmp', 'data.db');
const db = new Database(dbPath);
const tables = [
  'pages_parent_lnk',
  'pages_section_lnk',
  'pages_author_lnk',
  'pages',
  'sections',
  'authors'
];
for (const table of tables) {
  db.prepare(`DELETE FROM ${table}`).run();
}
db.prepare(
  "DELETE FROM sqlite_sequence WHERE name IN ('pages', 'sections', 'authors')"
).run();
console.log('Content tables cleared');

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const counts = {
  pages: db.prepare('SELECT COUNT(DISTINCT document_id) as count FROM pages').get().count,
  sections: db.prepare('SELECT COUNT(DISTINCT document_id) as count FROM sections').get().count,
  authors: db.prepare('SELECT COUNT(DISTINCT document_id) as count FROM authors').get().count,
  redirects: db.prepare('SELECT COUNT(DISTINCT document_id) as count FROM redirects').get().count,
  media: db.prepare('SELECT COUNT(*) as count FROM files').get().count,
};
console.log(counts);

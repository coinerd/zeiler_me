import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), '.tmp', 'data.db');
const db = new Database(dbPath, { readonly: true });
const row = db.prepare('SELECT access_key FROM strapi_api_tokens WHERE name = ?').get('DroidCLI');
if (!row || !row.access_key) {
  console.error('Full access token not found');
  process.exit(1);
}
const envPath = path.join(process.cwd(), '.env');
const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
const updated = lines.map((line) => {
  if (!line.startsWith('STRAPI_TOKEN=')) return line;
  return `STRAPI_TOKEN=${row.access_key}`;
});
fs.writeFileSync(envPath, updated.join('\n'));
console.log('cms/.env STRAPI_TOKEN updated from database token');

import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';

const cmsDir = process.cwd();
const projectRoot = path.join(cmsDir, '..');
dotenv.config({ path: path.join(projectRoot, '.env'), override: false });
dotenv.config({ path: path.join(cmsDir, '.env'), override: false });
const { createStrapi } = await import(pathToFileURL(path.join(cmsDir, 'node_modules', '@strapi/strapi', 'dist', 'index.js')));
const strapi = await createStrapi({ distDir: path.join(cmsDir, 'dist') });
await strapi.load();
const results = await strapi.entityService.findMany('api::section.section', {
  filters: { externalId: { ["$eq"]: '56182bead86cd73041b3a5b84f3594a64decd5b1' } },
  publicationState: 'preview',
});
console.log(results.map((r) => ({ id: r.id, title: r.title, externalId: r.externalId })));
await strapi.destroy();

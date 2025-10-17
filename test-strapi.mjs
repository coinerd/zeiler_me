import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';

const cmsDir = path.join(process.cwd(), 'cms');
dotenv.config({ path: path.join(process.cwd(), '.env'), override: false });
dotenv.config({ path: path.join(cmsDir, '.env'), override: false });
const strapiModule = await import(pathToFileURL(path.join(cmsDir, 'node_modules', '@strapi/strapi', 'dist', 'index.js')));
const { createStrapi } = strapiModule;
process.chdir(cmsDir);
const strapi = await createStrapi({ distDir: path.join(cmsDir, 'dist') });
await strapi.load();
console.log('strapi loaded');
await strapi.destroy();

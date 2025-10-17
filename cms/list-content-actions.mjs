#!/usr/bin/env node

import path from "path";
import dotenv from "dotenv";
import { pathToFileURL } from "url";

const cmsDir = path.resolve();
const projectRoot = path.resolve(cmsDir, "..");

dotenv.config({ path: path.join(projectRoot, ".env"), override: false });
dotenv.config({ path: path.join(cmsDir, ".env"), override: false });

const { createStrapi } = await import(
  pathToFileURL(path.join(cmsDir, "node_modules", "@strapi", "strapi", "dist", "index.js"))
);

const previousCwd = process.cwd();
process.chdir(cmsDir);

const strapi = await createStrapi({ distDir: path.join(cmsDir, "dist") });
await strapi.load();

try {
  const actions = Array.from(strapi.contentAPI.permissions.providers.action.keys()).sort();
  console.log(actions);
} finally {
  await strapi.destroy();
  process.chdir(previousCwd);
}

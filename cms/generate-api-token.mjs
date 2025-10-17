#!/usr/bin/env node

import path from "path";
import fs from "fs-extra";
import dotenv from "dotenv";
import { pathToFileURL } from "url";

const cmsDir = path.resolve();
const projectRoot = path.resolve(cmsDir, "..");

dotenv.config({ path: path.join(projectRoot, ".env"), override: false });
dotenv.config({ path: path.join(cmsDir, ".env"), override: false });

const strapiModule = await import(
  pathToFileURL(path.join(cmsDir, "node_modules", "@strapi", "strapi", "dist", "index.js"))
);

const { createStrapi } = strapiModule;

const previousCwd = process.cwd();
process.chdir(cmsDir);

const strapi = await createStrapi({ distDir: path.join(cmsDir, "dist") });
await strapi.load();

try {
  const apiTokenService = strapi.service("admin::api-token");
  if (!apiTokenService?.create) {
    throw new Error("Unable to access admin API token service");
  }

  const token = await apiTokenService.create({
    name: `automation-${Date.now()}`,
    description: "Generated via generate-api-token.mjs",
    type: "full-access",
  });

  const accessKey = token?.accessKey;
  if (!accessKey) {
    throw new Error("Failed to retrieve access key from Strapi service");
  }

  const envPath = path.join(cmsDir, ".env");
  const envLines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  let found = false;
  const updated = envLines.map((line) => {
    if (line.startsWith("STRAPI_TOKEN=")) {
      found = true;
      return `STRAPI_TOKEN=${accessKey}`;
    }
    return line;
  });
  if (!found) {
    updated.push(`STRAPI_TOKEN=${accessKey}`);
  }
  fs.writeFileSync(envPath, `${updated.filter(Boolean).join("\n")}\n`, "utf8");

  console.log("New API token generated and saved to cms/.env (length)", accessKey.length);
  console.log("Reminder: prefer STRAPI_TOKEN_RO for read-only operations.");
} finally {
  await strapi.destroy();
  process.chdir(previousCwd);
}

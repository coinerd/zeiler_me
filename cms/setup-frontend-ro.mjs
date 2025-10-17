#!/usr/bin/env node

import path from "path";
import fs from "fs-extra";
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

const permissions = [
  "api::page.page.find",
  "api::page.page.findOne",
  "api::section.section.find",
  "api::section.section.findOne",
  "api::redirect.redirect.find",
  "api::redirect.redirect.findOne",
  "plugin::upload.content-api.find",
  "plugin::upload.content-api.findOne",
];

async function ensureFrontendToken() {
  const tokenService = strapi.service("admin::api-token");
  const description = "Read-only token for frontend consumption";

  const existing = await tokenService.getByName("frontend-ro");
  let accessKey;
  let status;

  if (existing) {
    await tokenService.update(existing.id, {
      description,
      type: "custom",
      permissions,
    });
    const regenerated = await tokenService.regenerate(existing.id);
    accessKey = regenerated.accessKey;
    status = "updated";
  } else {
    const created = await tokenService.create({
      name: "frontend-ro",
      description,
      type: "custom",
      permissions,
    });
    accessKey = created.accessKey;
    status = "created";
  }

  if (!accessKey) {
    throw new Error("Failed to retrieve access key for frontend-ro token");
  }

  const envPath = path.join(cmsDir, ".env");
  const envLines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  let found = false;
  const updated = envLines.map((line) => {
    if (line.startsWith("STRAPI_TOKEN_RO=")) {
      found = true;
      return `STRAPI_TOKEN_RO=${accessKey}`;
    }
    return line;
  });

  if (!found) {
    updated.push(`STRAPI_TOKEN_RO=${accessKey}`);
  }

  fs.writeFileSync(envPath, `${updated.filter(Boolean).join("\n")}\n`, "utf8");

  console.log(
    `Read-only API token ${status}; saved to cms/.env (length ${accessKey.length}).`
  );
}

async function ensurePublicRoleReadAccess() {
  const enable = (process.env.ENABLE_PUBLIC_ROLE_READ || "").toLowerCase() === "true";
  if (!enable) {
    return null;
  }

  const roleRecord = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" }, populate: ["permissions"] });

  if (!roleRecord) {
    console.log("Public role not found; no permissions updated.");
    return { changed: false };
  }

  const before = new Set((roleRecord.permissions || []).map((perm) => perm.action));

  const roleService = strapi.service("plugin::users-permissions.role");
  const detailed = await roleService.findOne(roleRecord.id);
  const perms = detailed.permissions;

  const targets = [
    ["api::page", "page", "find"],
    ["api::page", "page", "findOne"],
    ["api::section", "section", "find"],
    ["api::section", "section", "findOne"],
  ];

  for (const [type, controller, action] of targets) {
    if (!perms[type]) {
      perms[type] = { controllers: {} };
    }
    if (!perms[type].controllers) {
      perms[type].controllers = {};
    }
    if (!perms[type].controllers[controller]) {
      perms[type].controllers[controller] = {};
    }
    perms[type].controllers[controller][action] = {
      enabled: true,
      policy: "",
    };
  }

  await roleService.updateRole(roleRecord.id, { permissions: perms });

  const enabledNow = targets
    .map(([type, controller, action]) => `${type}.${controller}.${action}`)
    .filter((action) => !before.has(action));

  if (enabledNow.length > 0) {
    console.log(
      `Public role updated with read access: ${enabledNow.join(", " )}.`
    );
  } else {
    console.log("Public role already had required read permissions.");
  }

  return {
    changed: enabledNow.length > 0,
    actions: enabledNow,
  };
}

try {
  await ensureFrontendToken();
  const publicRole = await ensurePublicRoleReadAccess();
  if (!publicRole) {
    console.log("Public role unchanged (ENABLE_PUBLIC_ROLE_READ not set to true).");
  }
  console.log("Reminder: prefer STRAPI_TOKEN_RO for read operations.");
} finally {
  await strapi.destroy();
  process.chdir(previousCwd);
}

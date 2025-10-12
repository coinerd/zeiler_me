import fs from "fs/promises";
import path from "path";

const baseDir = path.resolve("out/www.zeiler.me");
const outputFile = path.resolve("out/menu.json");

const IGNORE_FILES = new Set(["404.md"]);
const IGNORE_DIRS = new Set(["_assets"]);

function toTitle(slug) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Untitled";
}

async function readTitle(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    const match = text.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
  } catch (err) {
    console.warn(`Failed to read title from ${filePath}: ${err.message}`);
  }
  return toTitle(path.basename(filePath, path.extname(filePath)));
}

function toRoute(relPath) {
  let route = "/" + relPath.replace(/\\/g, "/");
  route = route.replace(/\.md$/i, "");
  if (route.endsWith("/index")) {
    route = route.slice(0, -6);
    if (route === "") route = "/";
  }
  return route;
}

async function processDir(absPath, relPath = "") {
  const entries = await fs.readdir(absPath, { withFileTypes: true });
  const dirs = [];
  const files = [];
  let indexNode = null;

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const childRel = relPath ? path.posix.join(relPath, entry.name) : entry.name;
      const child = await processDir(path.join(absPath, entry.name), childRel);
      if (child) dirs.push(child);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      if (IGNORE_FILES.has(entry.name)) continue;
      const childRel = relPath ? path.posix.join(relPath, entry.name) : entry.name;
      const absFile = path.join(absPath, entry.name);
      const route = toRoute(childRel);
      const title = await readTitle(absFile);
      const slug = entry.name.replace(/\.md$/i, "");
      const node = {
        type: "file",
        name: slug,
        title,
        route,
        rel: childRel,
      };
      if (slug.toLowerCase() === "index") {
        indexNode = node;
      } else {
        files.push(node);
      }
    }
  }

  dirs.sort((a, b) => a.title.localeCompare(b.title, "de"));
  files.sort((a, b) => a.title.localeCompare(b.title, "de"));

  const name = relPath ? path.posix.basename(relPath) : "";
  const title = indexNode?.title || toTitle(name || "Startseite");
  const route = indexNode?.route || (relPath ? "/" + relPath.replace(/\\/g, "/") : "/");

  return {
    type: "dir",
    name,
    slug: name,
    title,
    route,
    index: indexNode,
    files,
    dirs,
  };
}

async function main() {
  const tree = await processDir(baseDir, "");
  await fs.writeFile(outputFile, JSON.stringify(tree, null, 2), "utf8");
  console.log(`Menu tree saved to ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

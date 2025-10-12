#!/usr/bin/env node
// HTML → main-content → Markdown

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import https from "https";
import crypto from "crypto";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { Readability } from "@mozilla/readability";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exts = new Set([".html", ".htm", ".xhtml"]);
const mainCandidates = [
  "main",
  "article",
  "#main",
  ".main",
  "#content",
  ".content",
  ".post",
  ".entry-content",
  "section[role='main']",
];

function parseArgs(argv) {
  const args = { input: null, out: null, minChars: 200, ext: ".md", stdout: false, base: "https://www.zeiler.me/" };
  const it = argv[Symbol.iterator](); it.next(); it.next();
  for (let a of it) {
    if (!args.input && !a.startsWith("-")) { args.input = a; continue; }
    if (a === "-o" || a === "--out") { args.out = it.next().value; continue; }
    if (a === "--min-chars") { args.minChars = Number(it.next().value) || 200; continue; }
    if (a === "--ext") { args.ext = it.next().value || ".md"; continue; }
    if (a === "--stdout") { args.stdout = true; continue; }
    if (a === "--base-url") { args.base = it.next().value || args.base; continue; }
  }
  if (!args.input) {
    console.error("Usage: node extract-md.mjs <file|folder> [-o outDir] [--min-chars N] [--ext .md] [--stdout] [--base-url URL]");
    process.exit(1);
  }
  return args;
}

function stripBoilerplate(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function createTurndown(baseUrl, imageMap) {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
    strongDelimiter: "**",
  });

  td.addRule("imageWithAlt", {
    filter: "img",
    replacement: (content, node) => {
      const src = (node.getAttribute("src") || "").trim();
      if (!src) return "";
      const mapped = imageMap?.get(src);
      let href = mapped?.markdownSrc || src;
      if (!mapped) {
        try { href = new URL(src, baseUrl).href; } catch {}
      }
      const alt = node.getAttribute("alt") || "";
      const title = node.getAttribute("title");
      const t = title ? ` "${title}"` : "";
      return `![${alt}](${href}${t})`;
    },
  });

  td.keep(["table","thead","tbody","tr","th","td"]);
  return td;
}

function pickByHeuristicElement(doc, minChars) {
  const bad = /nav|menu|footer|header|aside|breadcrumb|sidebar|social|popup|modal|cookie/i;
  let best = null, bestScore = 0;
  const els = Array.from(doc.body.querySelectorAll("body, body *"));
  for (const el of els) {
    const tag = el.tagName;
    if (["SCRIPT","STYLE","NOSCRIPT","NAV","ASIDE","FOOTER","HEADER"].includes(tag)) continue;
    const cls = el.className || "", id = el.id || "";
    if (bad.test(cls) || bad.test(id)) continue;
    const text = (el.textContent || "").trim();
    if (!text) continue;
    const pCount = el.querySelectorAll("p").length;
    const hCount = el.querySelectorAll("h1,h2,h3").length;
    const score = pCount * 60 + hCount * 30 + Math.min(text.length, 5000);
    if (score > bestScore) { best = el; bestScore = score; }
  }
  if (best && (best.textContent || "").trim().length >= Math.max(100, Math.floor(minChars / 2))) {
    return best;
  }
  return doc.body;
}

function pickByHeuristic(doc, minChars) {
  const el = pickByHeuristicElement(doc, minChars);
  return el ? el.innerHTML : doc.body.innerHTML;
}

function findContentElementWithImages(document, minChars) {
  const minLen = Math.max(100, Math.floor(minChars / 2));
  for (const sel of mainCandidates) {
    const el = document.querySelector(sel);
    if (!el) continue;
    if (!(el.textContent || "").trim() || (el.textContent || "").trim().length < minLen) continue;
    if (el.querySelector("img")) {
      return el;
    }
  }
  const imgs = Array.from(document.querySelectorAll("img"));
  for (const img of imgs) {
    let node = img.parentElement;
    while (node && node !== document.body) {
      const text = (node.textContent || "").trim();
      if (text.length >= minLen) {
        return node;
      }
      node = node.parentElement;
    }
  }
  const heuristicEl = pickByHeuristicElement(document, minChars);
  if (heuristicEl && heuristicEl !== document.body && heuristicEl.querySelector && heuristicEl.querySelector("img")) {
    return heuristicEl;
  }
  return null;
}

function extractMainHTML(html, baseUrl, minChars) {
  const clean = stripBoilerplate(html);
  const dom = new JSDOM(clean, { url: baseUrl, pretendToBeVisual: true });
  const { document } = dom.window;

  const reader = new Readability(document);
  let article = null;
  try { article = reader.parse(); } catch {}

  if (article && article.content && (article.textContent || "").trim().length >= minChars) {
    const hasImages = /<img\b/i.test(article.content);
    if (!hasImages) {
      const alt = findContentElementWithImages(document, minChars);
      if (alt) {
        const extras = [];
        const seen = new Set();
        for (const img of alt.querySelectorAll("img")) {
          const src = (img.getAttribute("src") || "").trim();
          if (!src || seen.has(src)) continue;
          seen.add(src);
          extras.push(`<p>${img.outerHTML}</p>`);
        }
        if (extras.length > 0) {
          const merged = `${article.content}<div data-appended-images="true">${extras.join("")}</div>`;
          return { title: article.title || document.title || "", contentHTML: merged };
        }
      }
    }
    return { title: article.title || document.title || "", contentHTML: article.content };
  }

  for (const sel of mainCandidates) {
    const el = document.querySelector(sel);
    if (el && (el.textContent || "").trim().length >= Math.max(100, Math.floor(minChars / 2))) {
      return { title: document.title || "", contentHTML: el.innerHTML };
    }
  }

  return { title: document.title || "", contentHTML: pickByHeuristic(document, minChars) };
}

async function* walk(dir) {
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function replaceExt(p, newExt) {
  const ext = path.extname(p);
  return p.slice(0, -ext.length) + newExt;
}

function toPosix(p) {
  return p.replace(/\\/g, "/");
}

function isDataLike(src) {
  return /^(data:|javascript:|mailto:)/i.test(src);
}

function isRemoteLike(src) {
  return /^(https?:)?\/\//i.test(src);
}

function stripQueryAndHash(src) {
  const idx = src.search(/[?#]/);
  return idx === -1 ? src : src.slice(0, idx);
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "asset";
}

function hashForUrl(url) {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
}

function guessExtFromPath(pathname) {
  const match = pathname.match(/\.([a-zA-Z0-9]{1,5})$/);
  return match ? `.${match[1].toLowerCase()}` : "";
}

function extFromContentType(type) {
  if (!type) return "";
  const base = type.split(";")[0].trim().toLowerCase();
  switch (base) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    case "image/bmp":
      return ".bmp";
    case "image/avif":
      return ".avif";
    default:
      return "";
  }
}

async function fetchBuffer(url, redirectDepth = 0) {
  if (redirectDepth > 5) throw new Error(`Too many redirects while fetching ${url}`);
  const client = url.startsWith("https") ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.get(url, res => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, url).href;
        res.resume();
        fetchBuffer(nextUrl, redirectDepth + 1).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        resolve({ buffer: Buffer.concat(chunks), contentType: res.headers["content-type"] || "" });
      });
    });
    req.on("error", reject);
  });
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function resolveImage(rawSrc, baseUrl, srcPath, outRoot, outPath, inputRoot) {
  const trimmed = rawSrc.trim();
  if (!trimmed) return null;
  if (isDataLike(trimmed)) {
    return { original: trimmed, markdownSrc: trimmed };
  }
  if (isRemoteLike(trimmed)) {
    let urlObj;
    try {
      urlObj = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, baseUrl);
    } catch {
      return { original: trimmed, markdownSrc: trimmed };
    }
    const href = urlObj.href;
    if (!outRoot) {
      return { original: trimmed, markdownSrc: href };
    }
    const pathname = urlObj.pathname || "";
    const guessedExt = guessExtFromPath(pathname);
    const baseName = sanitizeFilename(path.basename(pathname) || "image");
    const stem = baseName.replace(/\.[^.]+$/, "") || "image";
    const hash = hashForUrl(href);
    const fileBase = `${stem}-${hash}`;
    const ext = guessedExt || ".jpg";
    const outDir = path.dirname(outPath);
    const assetsDir = path.join(outDir, "_assets");
    const destPath = path.join(assetsDir, `${fileBase}${ext}`);
    const markdownSrc = toPosix(path.relative(outDir, destPath));
    return {
      original: trimmed,
      markdownSrc,
      downloadUrl: href,
      downloadTo: destPath,
      ext,
      assetsDir,
      fileBase,
      outDir,
      urlHost: urlObj.host,
      urlPathname: urlObj.pathname,
    };
  }

  const clean = stripQueryAndHash(trimmed);
  let sourcePath;
  if (clean.startsWith("/")) {
    if (!inputRoot) {
      return { original: trimmed, markdownSrc: trimmed };
    }
    sourcePath = path.resolve(inputRoot, `.${clean}`);
  } else if (/^[a-zA-Z]:[\\/]/.test(clean) || path.isAbsolute(clean)) {
    sourcePath = clean;
  } else {
    sourcePath = path.resolve(path.dirname(srcPath), clean);
  }

  if (!outRoot) {
    return { original: trimmed, markdownSrc: trimmed, copyFrom: null, copyTo: null, sourcePath };
  }

  const relImage = path.relative(process.cwd(), sourcePath);
  if (!relImage || relImage.startsWith("..")) {
    return { original: trimmed, markdownSrc: trimmed };
  }

  const destImage = path.join(outRoot, relImage);
  const markdownRelative = toPosix(path.relative(path.dirname(outPath), destImage));
  return { original: trimmed, markdownSrc: markdownRelative || toPosix(path.basename(destImage)), copyFrom: sourcePath, copyTo: destImage };
}

async function downloadRemoteAssets(downloads) {
  for (const info of downloads) {
    if (!info.downloadUrl || !info.downloadTo) continue;
    try {
      if (await pathExists(info.downloadTo)) {
        info.markdownSrc = toPosix(path.relative(info.outDir, info.downloadTo));
        continue;
      }
      const { buffer, contentType } = await fetchBuffer(info.downloadUrl);
      let ext = info.ext || "";
      const typeExt = extFromContentType(contentType);
      if (typeExt && typeExt !== ext) {
        ext = typeExt;
        info.ext = ext;
        info.downloadTo = path.join(info.assetsDir, `${info.fileBase}${ext}`);
      }
      await fs.mkdir(path.dirname(info.downloadTo), { recursive: true });
      await fs.writeFile(info.downloadTo, buffer);
      info.markdownSrc = toPosix(path.relative(info.outDir, info.downloadTo));
    } catch (err) {
      info.markdownSrc = info.downloadUrl;
      console.warn(`Failed to download image ${info.downloadUrl}: ${err.message}`);
    }
  }
}

async function prepareImages(contentHTML, baseUrl, srcPath, outRoot, outPath, inputRoot) {
  if (!contentHTML) return { imageMap: null, copies: [] };
  let baseHost = null;
  try { baseHost = new URL(baseUrl).host; } catch {}
  const dom = new JSDOM(contentHTML);
  const imgs = Array.from(dom.window.document.querySelectorAll("img"));
  if (imgs.length === 0) return { imageMap: null, copies: [] };
  const imageMap = new Map();
  const copies = [];
  const downloads = [];
  for (const img of imgs) {
    const raw = (img.getAttribute("src") || "").trim();
    if (!raw || imageMap.has(raw)) continue;
    const info = resolveImage(raw, baseUrl, srcPath, outRoot, outPath, inputRoot);
    if (!info) continue;
    if (
      info.downloadUrl &&
      info.urlHost &&
      baseHost &&
      outRoot &&
      info.urlHost === baseHost &&
      info.urlPathname
    ) {
      const candidates = [];
      if (inputRoot) {
        candidates.push(path.resolve(inputRoot, `.${info.urlPathname}`));
      }
      candidates.push(path.resolve(path.dirname(srcPath), path.basename(info.urlPathname)));
      const localPath = await (async () => {
        for (const candidate of candidates) {
          const relLocal = path.relative(process.cwd(), candidate);
          if (!relLocal || relLocal.startsWith("..")) continue;
          if (await pathExists(candidate)) {
            return { candidate, relLocal };
          }
        }
        return null;
      })();
      if (localPath) {
        const destImage = path.join(outRoot, localPath.relLocal);
        info.copyFrom = localPath.candidate;
        info.copyTo = destImage;
        info.markdownSrc = toPosix(path.relative(path.dirname(outPath), destImage));
        info.downloadUrl = null;
        info.downloadTo = null;
      }
    }
    imageMap.set(raw, info);
    if (info.copyFrom && info.copyTo) {
      copies.push(info);
    }
    if (info.downloadUrl && info.downloadTo) {
      downloads.push(info);
    }
  }
  if (downloads.length > 0) {
    await downloadRemoteAssets(downloads);
  }
  return { imageMap, copies };
}

async function processFile(srcPath, outRoot, baseUrl, minChars, mdExt, stdout, inputRoot) {
  const html = await fs.readFile(srcPath, "utf8");
  const { title, contentHTML } = extractMainHTML(html, baseUrl, minChars);
  const relFromCwd = path.relative(process.cwd(), srcPath);
  const relOut = replaceExt(relFromCwd, mdExt);
  const outPath = outRoot ? path.join(outRoot, relOut) : replaceExt(srcPath, mdExt);
  const { imageMap, copies } = await prepareImages(contentHTML, baseUrl, srcPath, stdout ? null : outRoot, stdout ? null : outPath, inputRoot);
  const turndown = createTurndown(baseUrl, imageMap);
  let md = turndown.turndown(contentHTML || "");

  const firstLine = md.split(/\r?\n/, 1)[0] || "";
  if (!/^#\s+/.test(firstLine) && title && title.trim().length > 0) {
    md = `# ${title.trim()}\n\n${md}`;
  }

  if (stdout) { console.log(md); return; }

  if (copies && copies.length > 0) {
    const seen = new Set();
    for (const info of copies) {
      if (!info.copyFrom || !info.copyTo) continue;
      if (seen.has(info.copyTo)) continue;
      try {
        await fs.mkdir(path.dirname(info.copyTo), { recursive: true });
        await fs.copyFile(info.copyFrom, info.copyTo);
        seen.add(info.copyTo);
      } catch (err) {
        console.warn(`Failed to copy image ${info.copyFrom}: ${err.message}`);
      }
    }
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, md, "utf8");
  return outPath;
}

async function main() {
  const { input, out, minChars, ext, stdout, base } = parseArgs(process.argv);
  const stat = await fs.stat(input);
  if (stat.isDirectory()) {
    const inputRoot = input;
    let count = 0;
    for await (const f of walk(input)) {
      if (!exts.has(path.extname(f).toLowerCase())) continue;
      const outPath = await processFile(f, out, base, minChars, ext, false, inputRoot);
      process.stdout.write(`✓ ${outPath}\n`);
      count++;
    }
    process.stdout.write(`Done. Converted ${count} file(s).\n`);
  } else {
    const inputRoot = path.dirname(input);
    await processFile(input, out, base, minChars, ext, stdout || !out, inputRoot);
  }
}
main().catch(err => { console.error(err); process.exit(1); });

#!/usr/bin/env node
/**
 * ATELIER — WALL STORY · Image uniqueness audit
 *
 * Usage (dev server must be running):
 *   node scripts/audit-image-uniqueness.mjs [--base http://localhost:3000] [--json out.json]
 *
 * 1. Static pass  — hashes every file in public/images + public/samples (md5 = exact dupes,
 *                   64-bit dHash via macOS `sips` = near-duplicates / re-crops).
 * 2. Runtime pass — crawls every public route (+ discovered /projects/* and /blogs/* links),
 *                   scrolls each page, and records every rendered <img>, <video poster>
 *                   and CSS background-image with the section it sits in.
 * 3. Report       — cross-section reuse, exact/near duplicates, missing files, odd ratios.
 *                   Reuse listed in scripts/image-intentional-relationships.json is exempt.
 *
 * shortcut: near-duplicate hashing needs macOS `sips`; on other OSes that check is skipped.
 */
import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const args = process.argv.slice(2);
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = argVal("--base", "http://localhost:3000");
const JSON_OUT = argVal("--json", null);
const STATIC_ONLY = args.includes("--static-only");

const SEED_ROUTES = [
  "/",
  "/explore-designs",
  "/projects",
  "/services",
  "/about",
  "/process",
  "/blogs",
  "/blogs/from-catalogue-to-wall-visualizer-selecting-artwork-with-confidence",
  "/contact",
  "/visualizer",
];
const NEAR_DUP_MAX_DISTANCE = 6; // of 64 bits
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

const rawRelationships = JSON.parse(
  readFileSync(path.join(ROOT, "scripts/image-intentional-relationships.json"), "utf8")
);
const relationships = Array.isArray(rawRelationships)
  ? rawRelationships
  : rawRelationships.sharedEntityRelationships || [];
const beforeAfterPairs = Array.isArray(rawRelationships)
  ? []
  : rawRelationships.beforeAfterPairs || [];

// ---------------------------------------------------------------- static pass
async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(jpe?g|png|webp|avif|svg)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function hasSips() {
  try {
    execFileSync("which", ["sips"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function sipsInfo(file) {
  const raw = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], {
    encoding: "utf8",
  });
  const w = Number(/pixelWidth: (\d+)/.exec(raw)?.[1]);
  const h = Number(/pixelHeight: (\d+)/.exec(raw)?.[1]);
  return { width: w, height: h };
}

/** 64-bit difference hash from a 9x8 grayscale thumbnail rendered by sips as BMP. */
function dHash(file, tmpDir) {
  const out = path.join(tmpDir, `${crypto.randomUUID()}.bmp`);
  execFileSync("sips", ["-s", "format", "bmp", "-z", "8", "9", file, "--out", out], {
    stdio: "ignore",
  });
  const buf = readFileSync(out);
  const dataOffset = buf.readUInt32LE(10);
  const width = buf.readInt32LE(18);
  const rawHeight = buf.readInt32LE(22);
  const bpp = buf.readUInt16LE(28);
  const height = Math.abs(rawHeight);
  const bytesPerPx = bpp / 8;
  const rowSize = Math.ceil((width * bpp) / 32) * 4;
  const gray = [];
  for (let y = 0; y < height; y++) {
    const srcRow = rawHeight > 0 ? height - 1 - y : y; // BMP is bottom-up when height > 0
    const row = [];
    for (let x = 0; x < width; x++) {
      const o = dataOffset + srcRow * rowSize + x * bytesPerPx;
      row.push(0.114 * buf[o] + 0.587 * buf[o + 1] + 0.299 * buf[o + 2]);
    }
    gray.push(row);
  }
  let bits = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += gray[y][x] > gray[y][x + 1] ? "1" : "0";
  return bits;
}

const hamming = (a, b) => {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
};

async function staticPass() {
  const files = [
    ...(await walk(path.join(PUBLIC, "images"))),
    ...(existsSync(path.join(PUBLIC, "samples")) ? await walk(path.join(PUBLIC, "samples")) : []),
  ];
  const sips = hasSips();
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "atelier-audit-"));
  const assets = [];
  for (const file of files) {
    const buf = await fs.readFile(file);
    const rel = "/" + path.relative(PUBLIC, file).split(path.sep).join("/");
    const rec = { path: rel, bytes: buf.length, md5: crypto.createHash("md5").update(buf).digest("hex") };
    if (sips && IMAGE_EXT.test(file)) {
      try {
        Object.assign(rec, sipsInfo(file));
        rec.ratio = +(rec.width / rec.height).toFixed(3);
        rec.dhash = dHash(file, tmpDir);
      } catch {
        rec.hashError = true;
      }
    }
    assets.push(rec);
  }
  await fs.rm(tmpDir, { recursive: true, force: true });

  const byMd5 = new Map();
  for (const a of assets) byMd5.set(a.md5, [...(byMd5.get(a.md5) || []), a.path]);
  const exactDuplicates = [...byMd5.values()].filter((g) => g.length > 1);

  const nearDuplicates = [];
  const hashed = assets.filter((a) => a.dhash);
  for (let i = 0; i < hashed.length; i++) {
    for (let j = i + 1; j < hashed.length; j++) {
      if (hashed[i].md5 === hashed[j].md5) continue;
      const d = hamming(hashed[i].dhash, hashed[j].dhash);
      if (d <= NEAR_DUP_MAX_DISTANCE) nearDuplicates.push({ a: hashed[i].path, b: hashed[j].path, distance: d });
    }
  }
  return { assets, exactDuplicates, nearDuplicates, sips };
}

// --------------------------------------------------------------- runtime pass
function normaliseSrc(src) {
  if (!src) return null;
  try {
    const u = new URL(src, BASE);
    if (u.pathname.startsWith("/_next/image")) return decodeURIComponent(u.searchParams.get("url") || "");
    if (u.origin === new URL(BASE).origin) return u.pathname;
    return u.href;
  } catch {
    return src;
  }
}

async function runtimePass() {
  const { chromium } = await import(
    process.env.PLAYWRIGHT_MODULE ||
      "/Users/sumitthakur/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs"
  );
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const queue = [...SEED_ROUTES];
  const seen = new Set();
  const usages = [];
  const brokenOnPage = [];

  while (queue.length) {
    const route = queue.shift();
    if (seen.has(route)) continue;
    seen.add(route);
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await page.waitForTimeout(400);

    const found = await page.evaluate(() => {
      const label = (el) => {
        const sec = el.closest("section, header, footer, [role=dialog], article, main");
        if (!sec) return "page";
        const heading =
          (sec.getAttribute("aria-labelledby") &&
            document.getElementById(sec.getAttribute("aria-labelledby"))?.textContent) ||
          sec.getAttribute("aria-label") ||
          sec.querySelector("h1,h2,h3")?.textContent ||
          sec.id ||
          sec.tagName.toLowerCase();
        return heading.replace(/\s+/g, " ").trim().slice(0, 70);
      };
      const out = [];
      document.querySelectorAll("img").forEach((img) => {
        if (img.closest("footer, header") && /brand\//.test(img.currentSrc || img.src)) return;
        out.push({
          kind: "img",
          src: img.currentSrc || img.src,
          section: label(img),
          broken: img.complete && img.naturalWidth === 0,
          rendered: `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}`,
        });
      });
      document.querySelectorAll("video[poster]").forEach((v) =>
        out.push({ kind: "poster", src: v.poster, section: label(v), broken: false })
      );
      document.querySelectorAll("*").forEach((el) => {
        const bg = getComputedStyle(el).backgroundImage;
        if (!bg || bg === "none") return;
        for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
          if (m[1].startsWith("data:")) continue;
          out.push({ kind: "background", src: m[1], section: label(el), broken: false });
        }
      });
      const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
      return { out, links };
    });

    for (const f of found.out) {
      const src = normaliseSrc(f.src);
      if (!src || src.startsWith("/brand/")) continue;
      usages.push({ route, section: f.section, kind: f.kind, src, rendered: f.rendered });
      if (f.broken) brokenOnPage.push({ route, section: f.section, src });
    }
    for (const href of found.links) {
      if (!href) continue;
      const clean = href.split(/[?#]/)[0];
      if (/^\/(projects|blogs)\/[^/]+$/.test(clean) && !seen.has(clean)) queue.push(clean);
    }
  }
  await browser.close();
  return { usages, brokenOnPage, routes: [...seen] };
}

// --------------------------------------------------------------------- report
function isExempt(src, contexts) {
  return relationships.some((rel) => {
    if (!rel.assets.some((a) => src === a || (a.endsWith("*") && src.startsWith(a.slice(0, -1))))) return false;
    return contexts.every((ctx) => rel.allowedContexts.some((p) => new RegExp(p).test(ctx)));
  });
}

async function main() {
  const stat = await staticPass();
  const assetSet = new Map(stat.assets.map((a) => [a.path, a]));
  let runtime = { usages: [], brokenOnPage: [], routes: [] };
  if (!STATIC_ONLY) runtime = await runtimePass();

  // group runtime usages by source → distinct route::section contexts
  const bySrc = new Map();
  for (const u of runtime.usages) {
    const ctx = `${u.route} :: ${u.section}`;
    if (!bySrc.has(u.src)) bySrc.set(u.src, new Set());
    bySrc.get(u.src).add(ctx);
  }
  const crossSection = [];
  const intentional = [];
  for (const [src, ctxSet] of bySrc) {
    const ctxs = [...ctxSet];
    if (ctxs.length < 2) continue;
    (isExempt(src, ctxs) ? intentional : crossSection).push({ src, contexts: ctxs });
  }
  crossSection.sort((a, b) => b.contexts.length - a.contexts.length);

  const missing = [
    ...runtime.brokenOnPage,
    ...[...bySrc.keys()]
      .filter((s) => s.startsWith("/") && !s.startsWith("/_next") && !existsSync(path.join(PUBLIC, s)))
      .map((src) => ({ src, route: "(file not on disk)" })),
  ];
  const renderedPaths = new Set(bySrc.keys());
  const oddRatios = stat.assets.filter((a) => a.ratio && (a.ratio > 3 || a.ratio < 0.4));
  const unusedAssets = stat.assets.filter((a) => !renderedPaths.has(a.path)).map((a) => a.path);

  // near-duplicates that are actually *rendered* in two different contexts (excluding documented before/after room pairs)
  const isBeforeAfterPair = (a, b) =>
    beforeAfterPairs.some(
      ([x, y]) => (x === a && y === b) || (x === b && y === a)
    );
  const allRenderedNear = stat.nearDuplicates.filter(
    (p) => renderedPaths.has(p.a) && renderedPaths.has(p.b)
  );
  const intentionalBeforeAfterRendered = allRenderedNear.filter((p) =>
    isBeforeAfterPair(p.a, p.b)
  );
  const renderedNear = allRenderedNear.filter(
    (p) => !isBeforeAfterPair(p.a, p.b)
  );

  const summary = {
    routesCrawled: runtime.routes.length,
    totalImageReferences: runtime.usages.length,
    uniqueRenderedSources: bySrc.size,
    assetFilesOnDisk: stat.assets.length,
    exactDuplicateFileGroups: stat.exactDuplicates.length,
    possibleVisualDuplicatePairs: stat.nearDuplicates.length,
    intentionalBeforeAfterPairsRendered: intentionalBeforeAfterRendered.length,
    possibleVisualDuplicatesRendered: renderedNear.length,
    missingAssets: missing.length,
    intentionalSharedReferences: intentional.length,
    unresolvedCrossSectionReuse: crossSection.length,
    nearDuplicateCheck: stat.sips ? "dHash via sips" : "skipped (sips unavailable)",
  };

  console.log("\nATELIER IMAGE AUDIT");
  for (const [k, v] of Object.entries(summary)) console.log(`${k.padEnd(34)} ${v}`);
  if (crossSection.length) {
    console.log("\nUNRESOLVED CROSS-SECTION REUSE");
    for (const c of crossSection) {
      console.log(`\n  ${c.src}  (${c.contexts.length} contexts)`);
      c.contexts.forEach((x) => console.log(`    - ${x}`));
    }
  }
  if (stat.exactDuplicates.length) {
    console.log("\nEXACT DUPLICATE FILES");
    stat.exactDuplicates.forEach((g) => console.log("  " + g.join("  ==  ")));
  }
  if (renderedNear.length) {
    console.log("\nRENDERED NEAR-DUPLICATES (dHash distance)");
    renderedNear.forEach((p) => console.log(`  ${p.distance}  ${p.a}  ~  ${p.b}`));
  }
  if (missing.length) {
    console.log("\nMISSING / BROKEN");
    missing.forEach((m) => console.log(`  ${m.src}  @ ${m.route}`));
  }

  if (JSON_OUT) {
    await fs.writeFile(
      JSON_OUT,
      JSON.stringify(
        { summary, crossSection, intentional, exactDuplicates: stat.exactDuplicates, nearDuplicates: stat.nearDuplicates, missing, oddRatios, unusedAssets, usages: runtime.usages, assets: stat.assets.map(({ dhash, ...rest }) => rest) },
        null,
        2
      )
    );
    console.log(`\nJSON written to ${JSON_OUT}`);
  }
  if (crossSection.length || missing.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});


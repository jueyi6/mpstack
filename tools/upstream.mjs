#!/usr/bin/env node
// Read-only upstream check. Compares the pins in UPSTREAM.json with each
// upstream's default branch and lists the changed files mpstack tracks.
//   node tools/upstream.mjs                    summary
//   node tools/upstream.mjs --diff <path>      print one upstream file's diff
// Uses the public GitHub API. Set GITHUB_TOKEN to raise the rate limit.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pins = JSON.parse(readFileSync(resolve(root, "UPSTREAM.json"), "utf8"));
const headers = { "User-Agent": "mpstack-upstream-check", Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function api(path) {
  const res = await fetch(`https://api.github.com/${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

// Where an upstream file lands in mpstack, or null when mpstack does not carry it.
function target(key, file) {
  const pin = pins[key];
  if (!file.startsWith(pin.path + "/")) return null;
  const rest = file.slice(pin.path.length + 1);
  if (key === "pstack") {
    if (pin.skip.some((s) => rest.startsWith(s))) return null;
    const m = /^skills\/([^/]+)\/(.*)$/.exec(rest);
    if (m) return `skills/${pin.rename[m[1]] ?? m[1]}/${m[2]}`;
    if (rest.startsWith("agents/")) return rest;
    return null;
  }
  for (const [from, to] of Object.entries(pin.take)) {
    if (rest.startsWith(from + "/")) return `skills/${to}/${rest.slice(from.length + 1)}`;
  }
  return null;
}

async function compare(key) {
  const pin = pins[key];
  const files = [];
  let total = 0;
  let head = pin.commit;
  for (let page = 1; page <= 10; page++) {
    const data = await api(`repos/${pin.repo}/compare/${pin.commit}...HEAD?per_page=100&page=${page}`);
    total = data.total_commits;
    head = data.commits?.at(-1)?.sha ?? head;
    files.push(...(data.files ?? []));
    if ((data.files ?? []).length < 100) break;
  }
  return { pin, total, head, files };
}

const diffArg = process.argv.indexOf("--diff");
let changed = false;
for (const key of Object.keys(pins)) {
  const { pin, total, head, files } = await compare(key);
  if (diffArg > 0) {
    const want = process.argv[diffArg + 1];
    const hit = files.find((f) => f.filename === want || f.filename.endsWith("/" + want));
    if (hit) console.log(`--- ${pin.repo} ${hit.filename} (${hit.status})\n${hit.patch ?? "(no text patch; fetch the file)"}`);
    continue;
  }
  const tracked = files.map((f) => ({ ...f, to: target(key, f.filename) })).filter((f) => f.to);
  // Matt skills mpstack does not take, listed so a new useful one is noticed.
  const untaken = key === "matt" ? files.filter((f) => f.status === "added" && /SKILL\.md$/.test(f.filename) && !target(key, f.filename)) : [];
  if (!tracked.length && !untaken.length) {
    console.log(`${key}: up to date for tracked files (pin ${pin.version} @ ${pin.commit.slice(0, 8)}, ${total} upstream commit(s) since)`);
    continue;
  }
  changed = true;
  console.log(`${key}: ${tracked.length} tracked file(s) changed since ${pin.version} @ ${pin.commit.slice(0, 8)}. Upstream head ${head.slice(0, 8)} (${total} commits).`);
  for (const f of tracked) console.log(`  ${f.status.padEnd(8)} ${f.filename}\n           -> ${f.to}`);
  for (const f of untaken) console.log(`  new upstream skill, not taken: ${f.filename}`);
}
if (diffArg < 0) process.exit(changed ? 2 : 0);

#!/usr/bin/env node
// Lint for the mpstack tree. Run from the repo root: node tools/check.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = "mpstack";
const ENTRY_BUDGET = 13000; // characters, about 3.3k tokens
const problems = [];
const fail = (file, message) => problems.push(`${relative(root, file).split(sep).join("/")}: ${message}`);

// Words that mean a line was written for another harness or vendor.
const FORBIDDEN = [
  /\bcursor-team-kit\b/i,
  /\bBugbot\b/i,
  /\bgemini\b/i,
  /\bgrok\b/i,
  /\bgpt-\d/i,
  /\.cursor\//,
  /\.mdc\b/,
  /\bgeneralPurpose\b/,
  /\bAskQuestion\b/,
  /\bpoteto-mode\b/,
  /\bsetup-pstack\b/,
  /\bpstack-models\b/,
  /setup-matt-pocock-skills/,
  /\bmattpocock-skills:/,
  /\bgrill-with-docs\b/,
  /\bcontrol-(ui|cli)\b/,
  /\/deslop\b/,
  /docs\/harness/,
  /docs\/guide/,
];
// Files allowed to name upstream things: the maintainer runbook, the setup
// skill (it migrates the old rule file), and upstream code carried unchanged.
const EXEMPT = [/^skills\/update-mpstack\//, /^skills\/setup\/SKILL\.md$/, /^skills\/[^/]+\/scripts\//];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z-]+):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]] = kv[2];
  }
  return fields;
}

const skillsDir = join(root, "skills");
const skills = readdirSync(skillsDir).filter((n) => statSync(join(skillsDir, n)).isDirectory());

for (const name of skills) {
  const file = join(skillsDir, name, "SKILL.md");
  if (!existsSync(file)) {
    fail(join(skillsDir, name), "no SKILL.md");
    continue;
  }
  const fm = frontmatter(readFileSync(file, "utf8"));
  if (!fm) {
    fail(file, "no frontmatter");
    continue;
  }
  if (fm.name !== name) fail(file, `frontmatter name "${fm.name}" does not match folder`);
  if (!fm.description) fail(file, "no description");
  const hidden = fm["disable-model-invocation"] === "true";
  if (name === ENTRY && hidden) fail(file, "the entry skill must be model-invocable");
  if (name !== ENTRY && !hidden) fail(file, "missing disable-model-invocation: true");
}

const entry = readFileSync(join(skillsDir, ENTRY, "SKILL.md"), "utf8");
if (entry.length > ENTRY_BUDGET) fail(join(skillsDir, ENTRY, "SKILL.md"), `${entry.length} chars, budget ${ENTRY_BUDGET}`);
const routeAt = entry.indexOf("## 1. Say the route");
const buildAt = entry.indexOf("## Build");
const interviewAt = entry.indexOf("## Interview");
if (routeAt < 0 || interviewAt < routeAt || buildAt < interviewAt)
  fail(join(skillsDir, ENTRY, "SKILL.md"), "sections must run: route, Interview, Build");
if (!/\*\*Wayfind\*\*.*wayfinder\/SKILL\.md/.test(entry)) fail(join(skillsDir, ENTRY, "SKILL.md"), "the route step must send Wayfind to wayfinder");

const playbooks = readdirSync(join(skillsDir, ENTRY, "playbooks")).map((f) => f.replace(/\.md$/, ""));
const listed = /\n(Investigation, [^\n]+)\n/.exec(entry);
if (listed) {
  for (const title of listed[1].replace(/\.$/, "").split(", ")) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!playbooks.includes(slug)) fail(join(skillsDir, ENTRY, "SKILL.md"), `playbook "${title}" has no playbooks/${slug}.md`);
  }
} else fail(join(skillsDir, ENTRY, "SKILL.md"), "playbook list not found");

for (const m of entry.matchAll(/^- \*\*([^*]+?)\.\*\*|^- \*\*([^*]+?)\*\* \(`([^`]+)`\)/gm)) {
  const leaf = m[3] ?? "principle-" + m[1].toLowerCase().replace(/[^a-z0-9 -]/g, "").trim().replace(/\s+/g, "-");
  if (!skills.includes(leaf)) fail(join(skillsDir, ENTRY, "SKILL.md"), `principle leaf ${leaf} missing`);
}

const textFiles = [...walk(skillsDir), ...walk(join(root, "agents")), ...walk(join(root, "hooks"))].filter((f) =>
  /\.(md|mjs|json)$/.test(f),
);
for (const file of textFiles) {
  const rel = relative(root, file).split(sep).join("/");
  const text = readFileSync(file, "utf8");
  const exempt = EXEMPT.some((re) => re.test(rel));
  let fenced = false;
  text.split(/\r?\n/).forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced && file.endsWith(".md")) return;
    if (!exempt) for (const re of FORBIDDEN) if (re.test(line)) fail(file, `line ${i + 1}: forbidden term ${re}`);
    if (!file.endsWith(".md")) return;
    // Relative markdown links must resolve.
    for (const m of line.matchAll(/\]\((\.{1,2}\/[^)#\s]+|[A-Za-z0-9_.-]+\/[^)#\s:]+|[A-Za-z0-9_-]+\.md)(#[^)]*)?\)/g)) {
      if (/^https?:/.test(m[1])) continue;
      if (!existsSync(resolve(dirname(file), m[1]))) fail(file, `line ${i + 1}: broken link ${m[1]}`);
    }
    // `../name/SKILL.md` pointers must name a real skill.
    for (const m of line.matchAll(/\.\.\/([a-z0-9-]+)\/SKILL\.md/g)) {
      if (!skills.includes(m[1])) fail(file, `line ${i + 1}: no skill ${m[1]}`);
    }
    // /mpstack:name and mpstack:name references must name a real skill or agent.
    for (const m of line.matchAll(/\bmpstack:([a-z0-9-]+)/g)) {
      if (!skills.includes(m[1]) && !["poteto-agent", "comment-sicko"].includes(m[1]))
        fail(file, `line ${i + 1}: no skill mpstack:${m[1]}`);
    }
  });
}

for (const f of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", "hooks/hooks.json", "UPSTREAM.json"]) {
  try {
    JSON.parse(readFileSync(join(root, f), "utf8"));
  } catch (e) {
    fail(join(root, f), `invalid JSON: ${e.message}`);
  }
}

if (problems.length) {
  console.log(problems.join("\n"));
  console.log(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`ok: ${skills.length} skills, entry ${entry.length} chars`);

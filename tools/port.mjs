#!/usr/bin/env node
// First-pass port of upstream text into mpstack's vocabulary.
//
// A maintainer aid, not a build step. It applies only the mechanical renames
// (tool names, model slugs, paths, skill names). Everything it writes is then
// read and finished by hand, and the committed files are the source of truth.
// Write into a scratch folder, never into the repo.
//
//   node tools/port.mjs <pstack-claude-code-tree> <mattpocock-skills-repo> <out-dir>
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname, basename, relative, sep } from "node:path";

const PSTACK_SKIP = new Set(["make-bot-ui"]);
const PSTACK_RENAME = { "poteto-mode": "mpstack", "poteto-help": "help", "setup-pstack": "setup" };
const MATT_TAKE = {
  "productivity/grilling": "grill",
  "engineering/domain-modeling": "domain-modeling",
  "engineering/to-spec": "to-spec",
  "engineering/to-tickets": "to-tickets",
  "engineering/setup-matt-pocock-skills": "setup-tracker",
  "engineering/research": "research",
  "engineering/wayfinder": "wayfinder",
};
const SKIP_PATHS = ["statechart/scripts/test/"];

const ADAPTER_LINE =
  /In Claude Code, read \[the Claude Code adapter\]\([^)]*\) once per session before you follow this skill\. It maps the Cursor names in pstack skills to Claude Code\.\n\n?/g;
const SIBLINGS = "Other mpstack skills live at `../<name>/SKILL.md`. Read one to run it.\n\n";

const PLAIN = [
  ["claude-opus-5-5-xhigh-fast", "opus xhigh"],
  ["claude-opus-5-5-high-fast", "opus high"],
  ["claude-opus-5-5-medium-fast", "opus medium"],
  ["claude-opus-5-5-low-fast", "opus low"],
  ["claude-fable-5-2-high", "fable high"],
  ["gemini-4-neon-xhigh", "sonnet high"],
  ["~/.cursor/rules/pstack-models.mdc", "~/.claude/rules/mpstack-models.md"],
  ["pstack-models.mdc", "mpstack-models.md"],
  ["`AskQuestion`", "`AskUserQuestion`"],
  ["AskQuestion", "AskUserQuestion"],
  ["generalPurpose", "general-purpose"],
  ["`Task`", "`Agent`"],
  ["Task tool", "Agent tool"],
  ["Task call", "Agent call"],
  ["Task spawn", "Agent spawn"],
  ["Task subagent", "subagent"],
  ["`poteto-agent`", "`mpstack:poteto-agent`"],
  ["`comment-sicko`", "`mpstack:comment-sicko`"],
  ["~/.cursor/skills/", "~/.claude/skills/"],
  [".cursor/skills/", ".claude/skills/"],
  ["~/.cursor/plugins/", "~/.claude/plugins/"],
  [".cursor-plugin/plugin.json", ".claude-plugin/plugin.json"],
  ["Cursor's `/loop` command", "Claude Code's `/loop` command"],
  ["`/deslop` from the `cursor-team-kit` plugin", "the built-in `simplify` skill (`/simplify`)"],
  ["`/deslop` from `cursor-team-kit`", "the built-in `simplify` skill (`/simplify`)"],
];
const FRONTMATTER_DROP = /^(icon|color|mode|reminder|is_background|argument-hint):.*\n/gm;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function portText(text, names, isSkillMd, adapterNote) {
  text = text.replace(ADAPTER_LINE, adapterNote ? SIBLINGS : "");
  for (const [from, to] of PLAIN) text = text.split(from).join(to);
  for (const [from, to] of Object.entries(PSTACK_RENAME))
    text = text.replace(new RegExp(`(?<![\\w-])${escape(from)}(?![\\w-])`, "g"), to);
  const alt = [...names].sort((a, b) => b.length - a.length).map(escape).join("|");
  text = text.replace(new RegExp(`(?<![\\w/:.\`-])/(${alt})(?![\\w-])`, "g"), "/mpstack:$1");
  text = text.replace(new RegExp(`\`/(${alt})\``, "g"), "`/mpstack:$1`");
  text = text.replace(/(?<![\w/.-])pstack(?![\w/-])/g, "mpstack");
  if (isSkillMd) {
    const head = /^---\n[\s\S]*?\n---\n/.exec(text);
    if (head) text = head[0].replace(FRONTMATTER_DROP, "") + text.slice(head[0].length);
  }
  return text;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function decode(buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(buffer);
  } catch {
    return null;
  }
}

function copyTree(src, dst, names, renameTo) {
  for (const file of walk(src)) {
    const rel = relative(src, file).split(sep).join("/");
    if (SKIP_PATHS.some((p) => `${basename(src)}/${rel}`.includes(p))) continue;
    const target = join(dst, rel);
    mkdirSync(dirname(target), { recursive: true });
    const text = file.endsWith(".md") ? decode(readFileSync(file)) : null;
    if (text === null) {
      copyFileSync(file, target);
      continue;
    }
    const isSkill = rel === "SKILL.md";
    let out = portText(text.replace(/\r\n/g, "\n"), names, isSkill, isSkill);
    if (isSkill && renameTo) out = out.replace(/^name:.*$/m, `name: ${renameTo}`);
    writeFileSync(target, out);
  }
}

const [pstack, matt, outDir] = process.argv.slice(2);
if (!outDir) {
  console.error("usage: node tools/port.mjs <pstack-claude-code-tree> <mattpocock-skills-repo> <out-dir>");
  process.exit(1);
}
const pSkills = readdirSync(join(pstack, "skills")).filter((d) => !PSTACK_SKIP.has(d)).sort();
const names = new Set([...pSkills.map((n) => PSTACK_RENAME[n] ?? n), ...Object.values(MATT_TAKE)]);
for (const n of pSkills) {
  const to = PSTACK_RENAME[n] ?? n;
  copyTree(join(pstack, "skills", n), join(outDir, "skills", to), names, to !== n ? to : null);
}
for (const [from, to] of Object.entries(MATT_TAKE)) copyTree(join(matt, "skills", from), join(outDir, "skills", to), names, to);
mkdirSync(join(outDir, "agents"), { recursive: true });
for (const f of readdirSync(join(pstack, "agents"))) {
  const raw = readFileSync(join(pstack, "agents", f), "utf8").replace(/\r\n/g, "\n");
  writeFileSync(join(outDir, "agents", f), portText(raw, names, true, false).replace(/^model:.*\n/gm, ""));
}
console.log(names.size, "skills:", [...names].sort().join(" "));

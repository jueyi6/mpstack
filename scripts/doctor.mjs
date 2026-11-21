import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const PACKS = {
  pstack: { plugin: "pstack", preferred: "pstack@cursor-plugins" },
  matt: { plugin: "mattpocock-skills", preferred: "mattpocock-skills@mattpocock" },
};

const PSTACK_FILES = [
  "docs/harness/claude-code.md",
  "skills/poteto-mode/SKILL.md",
  "skills/poteto-mode/worker.md",
  "skills/poteto-mode/playbooks/feature.md",
  "skills/poteto-mode/playbooks/bug-fix.md",
  "skills/poteto-mode/playbooks/prototype.md",
  "skills/poteto-mode/playbooks/opening-a-pr.md",
  "skills/poteto-mode/playbooks/multi-phase-plan.md",
  "skills/tdd/SKILL.md",
  "skills/architect/SKILL.md",
  "skills/arena/SKILL.md",
  "skills/interrogate/SKILL.md",
  "skills/no-comments/SKILL.md",
  "skills/figure-it-out/SKILL.md",
  "skills/why/SKILL.md",
  "skills/how/SKILL.md",
];

// Matt skills the mpstack skill routes to. `byModel` ones are called through the Skill tool,
// so they must stay model-invocable. The rest are read by path.
const MATT_ROUTED = {
  "grill-with-docs": {},
  "grill-me": {},
  "to-spec": {},
  "to-tickets": {},
  "setup-matt-pocock-skills": {},
  grilling: { byModel: true },
  "domain-modeling": { byModel: true },
  research: { byModel: true },
};

// Matt skills whose job pstack owns. The session hook tells the model not to reach for these.
export const MATT_UNUSED_BY_MODEL = ["tdd", "diagnosing-bugs", "prototype", "codebase-design", "code-review", "pr", "writing-for-agents"];

const RETIRED_ROLES = [
  "hardest tasks",
  "how explorer",
  "how explainer",
  "why investigators",
  "why synthesizer",
  "reflect tooling",
  "reflect judgment, divergent, synthesizer",
  "architect runners",
];

const configDir = () => process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
};

const frontmatter = (path) => {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? "";
  const field = (key) => new RegExp(`^${key}:\\s*(.*)$`, "m").exec(block)?.[1]?.trim();
  return {
    name: field("name")?.replace(/^["']|["']$/g, ""),
    modelInvocable: field("disable-model-invocation") !== "true",
  };
};

const skillsUnder = (dir) => {
  const found = {};
  const walk = (current, depth) => {
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === "node_modules") continue;
      const child = join(current, entry.name);
      const meta = frontmatter(join(child, "SKILL.md"));
      if (meta) found[meta.name || entry.name] = { path: join(child, "SKILL.md"), ...meta };
      else if (depth < 2) walk(child, depth + 1);
    }
  };
  walk(dir, 0);
  return found;
};

const mattSkills = (root) => {
  const manifest = readJson(join(root, ".claude-plugin", "plugin.json"));
  if (!Array.isArray(manifest?.skills)) return skillsUnder(join(root, "skills"));
  const found = {};
  for (const rel of manifest.skills) {
    const path = join(root, rel, "SKILL.md");
    const meta = frontmatter(path);
    if (meta) found[meta.name || rel.split("/").pop()] = { path, ...meta };
  }
  return found;
};

const versionOf = (root) =>
  (readJson(join(root, ".claude-plugin", "plugin.json")) ?? readJson(join(root, "plugin.json")))?.version;

function locate(pack, installed, enabled, problems) {
  const usable = Object.entries(installed)
    .filter(([id]) => id.startsWith(`${pack.plugin}@`))
    .flatMap(([id, installs]) => installs.map((install) => ({ id, root: install.installPath })))
    .filter(({ id, root }) => enabled[id] !== false && existsSync(root) && !existsSync(join(root, ".orphaned_at")));
  const ids = [...new Set(usable.map(({ id }) => id))];
  if (ids.length > 1) {
    problems.push(
      `Two copies of the ${pack.plugin} plugin are enabled (${ids.join(", ")}), so its skills load twice. Keep ${pack.preferred} and disable the other.`,
    );
  }
  const chosen = usable.find(({ id }) => id === pack.preferred) ?? usable[0];
  if (!chosen) {
    problems.push(`The ${pack.plugin} plugin is not installed or not enabled. Install it with: /plugin install ${pack.preferred}`);
  }
  return chosen?.root;
}

export function inspect() {
  const dir = configDir();
  const problems = [];
  const installed = readJson(join(dir, "plugins", "installed_plugins.json"))?.plugins ?? {};
  const enabled = readJson(join(dir, "settings.json"))?.enabledPlugins ?? {};

  const pstackRoot = locate(PACKS.pstack, installed, enabled, problems);
  const mattRoot = locate(PACKS.matt, installed, enabled, problems);

  const pstack = pstackRoot ? skillsUnder(join(pstackRoot, "skills")) : {};
  const matt = mattRoot ? mattSkills(mattRoot) : {};

  if (pstackRoot) {
    const missing = PSTACK_FILES.filter((rel) => !existsSync(join(pstackRoot, rel)));
    if (missing.length) {
      problems.push(`pstack no longer ships ${missing.join(", ")}. mpstack routes to these, so its skill needs updating.`);
    }
  }

  if (mattRoot) {
    const missing = Object.keys(MATT_ROUTED).filter((name) => !matt[name]);
    if (missing.length) {
      problems.push(
        `Matt Pocock's plugin no longer ships ${missing.join(", ")} (renamed or removed upstream). Read its ask-matt skill for the current names, and mpstack's skill needs updating.`,
      );
    }
    const locked = Object.entries(MATT_ROUTED)
      .filter(([name, route]) => route.byModel && matt[name] && !matt[name].modelInvocable)
      .map(([name]) => name);
    if (locked.length) {
      problems.push(`The Skill tool now refuses these Matt skills: ${locked.join(", ")}. Read their SKILL.md by path instead.`);
    }
  }

  const collisions = Object.keys(pstack).filter(
    (name) => pstack[name].modelInvocable && matt[name]?.modelInvocable,
  );

  const personal = skillsUnder(join(dir, "skills"));
  const shadowed = Object.keys(personal).filter((name) => pstack[name] || matt[name]);
  if (shadowed.length) {
    problems.push(
      `Personal skills in ${join(dir, "skills")} share a name with an upstream skill: ${shadowed.join(", ")}. Rename or remove them.`,
    );
  }

  const rules = join(dir, "rules", "pstack-models.md");
  if (!existsSync(rules)) {
    problems.push(`${rules} is missing, so pstack roles fall back to their defaults. Run /pstack:setup-pstack.`);
  } else {
    const text = readFileSync(rules, "utf8");
    const stale = RETIRED_ROLES.filter((role) => new RegExp(`^${role}:`, "m").test(text));
    if (stale.length) problems.push(`${rules} still sets retired pstack roles: ${stale.join(", ")}. Delete those lines.`);
  }

  return {
    pstackRoot,
    mattRoot,
    versions: { pstack: pstackRoot && versionOf(pstackRoot), matt: mattRoot && versionOf(mattRoot) },
    skillNames: { pstack: Object.keys(pstack).sort(), matt: Object.keys(matt).sort() },
    collisions,
    problems,
  };
}

// Reports what changed upstream since the last session, once, then remembers the new state.
export function changesSinceLastRun(report) {
  const stateDir = process.env.CLAUDE_PLUGIN_DATA || join(configDir(), "plugins", "data", "mpstack");
  const statePath = join(stateDir, "state.json");
  const previous = readJson(statePath);
  const current = { versions: report.versions, skillNames: report.skillNames };
  const notes = [];
  if (previous) {
    for (const pack of ["pstack", "matt"]) {
      const before = previous.versions?.[pack];
      const after = current.versions[pack];
      if (before && after && before !== after) notes.push(`${pack} updated from ${before} to ${after}.`);
      const old = new Set(previous.skillNames?.[pack] ?? []);
      const now = new Set(current.skillNames[pack]);
      const added = [...now].filter((name) => !old.has(name));
      const removed = [...old].filter((name) => !now.has(name));
      if (old.size && added.length) notes.push(`${pack} added skills: ${added.join(", ")}.`);
      if (old.size && removed.length) notes.push(`${pack} removed skills: ${removed.join(", ")}.`);
    }
  }
  if (JSON.stringify(previous) !== JSON.stringify(current) && report.pstackRoot && report.mattRoot) {
    try {
      mkdirSync(stateDir, { recursive: true });
      writeFileSync(statePath, JSON.stringify(current, null, 2));
    } catch {
      notes.push(`mpstack could not save its state to ${statePath}.`);
    }
  }
  return notes;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = inspect();
  const lines = [
    `pstack ${report.versions.pstack ?? "missing"}: ${report.pstackRoot ?? "-"}`,
    `mattpocock-skills ${report.versions.matt ?? "missing"}: ${report.mattRoot ?? "-"}`,
    `skills: pstack ${report.skillNames.pstack.length}, matt ${report.skillNames.matt.length}`,
    `names both packs let the model invoke: ${report.collisions.join(", ") || "none"}`,
    report.problems.length ? `problems:\n- ${report.problems.join("\n- ")}` : "problems: none",
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
  process.exitCode = report.problems.length ? 1 : 0;
}


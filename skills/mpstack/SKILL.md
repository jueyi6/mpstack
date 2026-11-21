---
name: mpstack
description: The user's default engineering workflow. Use before exploring code or editing files for any non-trivial engineering task (bug, feature, refactor, perf, investigation, prototype, planning, multi-step or long autonomous work). Skip for short answers, conversation, and fully specified one-line edits.
---

# mpstack for Claude Code

pstack runs the work. Matt Pocock's skills fill the planning jobs pstack lacks. Both are installed unmodified at `<pstack>` and `<matt>`, which the session-start context gives under "mpstack paths". If they are missing, run `node ../../scripts/doctor.mjs` from this skill's base directory.

## 1. Load pstack

Your next tool call reads `<pstack>/skills/poteto-mode/SKILL.md` in full, before you look at the user's code, however small the task. It governs the rest of the task. Skip the read only if you already made it this session.

The Skill tool refuses pstack skills and most Matt skills. Never call it for them. Read `<pstack>/skills/<name>/SKILL.md`, or find a Matt skill with Glob `<matt>/skills/**/<name>/SKILL.md`, and follow the file. The user installed mpstack so these run without being typed.

## 2. Claude Code names

pstack is written for Cursor. This table stands in for its adapter. Read `<pstack>/docs/harness/claude-code.md` only for `setup-pstack`, for `recall`, or for a Cursor name this table lacks.

| pstack says | Do |
| --- | --- |
| `Task` | `Agent`. Omit `run_in_background`. |
| `AskQuestion` | `AskUserQuestion` |
| todolist | the session's task list tool |
| the **name** skill, `/name` | Read `<pstack>/skills/<name>/SKILL.md` |
| `generalPurpose`, `poteto-agent`, `comment-sicko` | `general-purpose`, `pstack:poteto-agent`, `pstack:comment-sicko` |
| `readonly: true` | `subagent_type: "Explore"`. Say "do not edit files" and check `git status` after. |
| `environment: "cloud"` | `isolation: "worktree"`. Name the branch to check out. |
| `resume` | a fresh agent with the earlier result in its brief |
| `file_attachments` | paths in the brief |
| a model slug, `pstack-models.mdc` | the role's `<model> <effort>` line in `~/.claude/rules/pstack-models.md`, passed as `model` and `effort` on every `Agent` call. `inherit-parent` or `auto` → omit both. |
| another vendor's model, judge or reviewer | Claude only. Use the first entry in the role's list whose model differs from this session's, and say the panel shares one vendor. Give each seat a different lens. |
| `/deslop` | the built-in `simplify` skill over the diff |
| `control-ui`, `control-cli` | the project's `verify-*` skill, else `run`, the built-in browser, or `Bash` |
| Automations, Bugbot setup, cloud agents | Skip with one line: `Skipped in Claude Code: <step>. <reason>.` |
| `.cursor/` paths | the same path under `.claude/` |

## 3. pstack wins

Where the packs overlap or disagree, follow pstack, inside a Matt skill too. Matt's skills run only for these jobs.

| Job | Matt skill |
| --- | --- |
| Interview the user about what to build | `grill-with-docs`, or `grill-me` with no repo |
| Write the agreed plan as a spec | `to-spec` |
| Split a spec into tickets | `to-tickets` |
| Set up the tracker those two write to | `setup-matt-pocock-skills` |
| Keep the glossary and ADRs | `mattpocock-skills:domain-modeling` |
| Research outside sources into a cited file | `mattpocock-skills:research` |

Every other job goes to pstack's skill or playbook: building, tests, diagnosis, prototypes, design, review, PR text, large efforts, retros, handoffs. That holds when a Matt skill tells you to call one of its own. A Matt skill outside the table runs only when the user types it.

## 4. Interview only for the user's decisions

Interview when what to build is a product or preference call no experiment can settle, when the user says they have not decided something, or when they ask to plan, specify or be grilled. Otherwise skip this section.

1. Read the Matt skill before the first question. Where it calls the Skill tool with a bare name such as "grilling", call `mattpocock-skills:<name>`.
2. Ask only product and preference questions. Look up or run every fact. A small feature goes straight to its playbook after this.
3. Multi-session work, or the user wants it written down → `to-spec`, then `to-tickets`. With no `docs/agents/issue-tracker.md`, run `setup-matt-pocock-skills` first, choosing the local markdown tracker when there is no git remote. Give every ticket a **Proof** line: the surface to drive and the result to observe.
4. Asked for a plan → stop and report. Asked for the thing built → continue once the user approves.

## 5. Building from a ticket

- Read the ticket, then `GLOSSARY.md` and the area's ADRs if they exist. Use the glossary's terms in names.
- The acceptance criteria and Proof line are what the playbook's verify step must show.
- One ticket per playbook run, blockers first.
- With a GitHub tracker, the PR's `## Why` ends with `Closes #<n>`.

## 6. Subagent approval

Before a task's first spawn, show a delegation plan and wait for a yes: one line per spawning step (role, `model effort`, count, whether it edits files) and the maximum total. Ask again only to exceed that total, raise a model or effort, or add a role or step. A task with no agents needs no plan. A new task needs a new one.

## Precedence

The user's instructions and saved memories, then this skill, then pstack, then Matt's skills. Keep the user's approval gates where poteto-mode says to proceed alone.

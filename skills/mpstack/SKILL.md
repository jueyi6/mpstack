---
name: mpstack
description: The user's default engineering workflow in Claude Code. pstack's poteto-mode runs the work, and Matt Pocock's skills fill the planning steps pstack lacks. Use before exploring code or editing files for any non-trivial engineering task — bug fix, feature, refactor, perf, investigation of how or why code works, prototype, planning or specifying a feature, multi-step change, or a long autonomous run. Skip for short answers, pure conversation, and one-line edits.
---

# mpstack for Claude Code

Two upstream plugins are installed unmodified and update on their own. This skill is the only place that joins them.

- `<pstack>` is pstack (Lauren Tan). It is the primary pack.
- `<matt>` is Matt Pocock's skills. It fills what pstack lacks.

Both paths are in the session-start context under "mpstack paths". If they are missing, run `node ../../scripts/doctor.mjs` from this skill's base directory and take them from its first two lines.

Most skills in both packs are marked for the user to type, so the Skill tool refuses them. Never call the Skill tool for one of those. Read its `SKILL.md` and follow it. The user installed mpstack so these run without being typed, and pstack's own Claude Code adapter prescribes the same read. The Skill tool works only for the `mattpocock-skills:` names this file spells out.

## 1. Load pstack

Your next two tool calls are these reads. Make them before you look at the user's code, however small the task seems. Loading this skill without them runs neither pack.

1. Read `<pstack>/docs/harness/claude-code.md`. Once per session is enough.
2. Read `<pstack>/skills/poteto-mode/SKILL.md` in full. It governs the rest of this task.

Run any other pstack skill by reading `<pstack>/skills/<name>/SKILL.md`.

## 2. pstack wins

Where the two packs overlap or disagree, in a rule, a step, a format or a sentence, follow pstack. This holds while you are inside a Matt skill too. pstack's Non-negotiables, principles, playbooks, reply style and PR format apply the whole time.

A Matt skill runs only for a job in this table. pstack has no skill for these.

| Job | Matt skill |
| --- | --- |
| Interview the user about what to build | `grill-with-docs`, or `grill-me` with no repo. Both call `mattpocock-skills:grilling`. |
| Write the agreed plan as a spec | `to-spec` |
| Split a spec into tickets | `to-tickets` |
| Set up the tracker those two write to | `setup-matt-pocock-skills` |
| Keep the glossary and ADRs | `mattpocock-skills:domain-modeling` |
| Research outside sources into a cited file | `mattpocock-skills:research` |

Everything else belongs to pstack. Use the Matt skill in the right column only when the user types it.

| Job | pstack owner | Matt skill left unused |
| --- | --- | --- |
| Building anything | the matching poteto-mode playbook | `implement`, `implement-spec` |
| Tests | pstack `tdd` and the test-behavior-not-implementation principle | `tdd` |
| Bug and perf diagnosis | Bug fix, Perf issue and forensics playbooks | `diagnosing-bugs` |
| Prototype | Prototype playbook | `prototype` |
| Design and architecture | `architect`, `arena` | `codebase-design`, `improve-codebase-architecture` |
| Review | `no-comments`, `interrogate` | `code-review` |
| PR title and body | Opening a PR playbook | `pr` |
| Work too big for one session | `figure-it-out`, Multi-phase plan playbook | `wayfinder` |
| This repo's history and behaviour | `why`, `how` | `research` |
| Lessons after a task | `reflect`, `correct` | `retro` |
| Handing work over | Pause safely and Session pickup playbooks | `handoff` |
| Writing for agents | `technical-writing`, `unslop`, Authoring a skill playbook | `writing-for-agents` |

When a Matt skill you are following tells you to call one from the right column, do the pstack owner's step. The built-in `/code-review` stays the user's own command.

## 3. Decide only what the user must decide

poteto-mode settles most forks without the user. Keep that. Interview the user only when one of these holds:

- what to build is open and no experiment can settle it (a product or preference call);
- the user says they have not decided something;
- the user asks to plan, specify, or be grilled.

Then:

1. Find the Matt skill with Glob `<matt>/skills/**/<name>/SKILL.md` and read it before you ask the first question. Never interview from memory. Where it says to call the Skill tool with a bare name such as "grilling", call `mattpocock-skills:<name>`. If the Skill tool refuses, read that file too.
2. `grill-with-docs`, or `grill-me` with no repo. Ask only the product and preference questions. Look up or run everything that is a fact. A small feature stops here and goes to Build.
3. Multi-session work, or the user wants it written down → `to-spec`, then `to-tickets`. If the repo has no `docs/agents/issue-tracker.md`, run `setup-matt-pocock-skills` first, and with no git remote choose the local markdown tracker. Add a **Proof** line to every ticket: the surface to drive and the result to observe.
4. The user asked for a plan → stop and report. The user asked for the thing built → continue once they approve.

A task the user already specified skips this section.

## 4. Build

Run the poteto-mode playbook that fits. When the work comes from a ticket or spec, add these to it:

- Read the ticket, then `GLOSSARY.md` and the ADRs for the area if they exist. Use the glossary's terms in names.
- The ticket's acceptance criteria and Proof line are what the playbook's verify step must show.
- One ticket per playbook run, blockers first.
- The PR's `## Why` ends with `Closes #<n>` when the tracker is GitHub.

## 5. Claude only

Every agent runs on a Claude model. Take each role's `model` and `effort` from `~/.claude/rules/pstack-models.md` and pass both on every `Agent` call.

- A pstack skill names a Gemini, Grok or GPT model → use the role's line from the rule. Never try another vendor's model.
- A pstack skill wants a judge or reviewer "from another vendor" (arena's cross-judge, a second opinion) → there is none. Use the first entry in the role's list whose model differs from this session's model, or the first entry if all match. Say in the reply that the panel shares one vendor.
- A panel of Claude models agrees more easily than a mixed one. Give each seat a different lens in its brief, and never show one seat another's output before it reports.

pstack also names Cursor tools its adapter leaves out:

- `/deslop` from `cursor-team-kit` → the built-in `simplify` skill over the diff.
- `control-ui`, `control-cli` → the project's `verify-*` skill if it has one. Otherwise the `run` skill, the built-in browser, or `Bash`.
- The todolist → whichever task list tool this session offers.
- Cursor's `/loop` → Claude Code's `/loop`.

## 6. Subagent approval

The user approves delegation once per task, not once per agent. Right after you match a playbook, and before the first spawn, show a delegation plan and wait for an explicit yes:

- one line per step that spawns agents: the step, the role, `model effort`, how many, and whether it edits files;
- the total maximum number of agents.

After approval, spawn within the plan without asking again. Ask again before going outside it:

- the total would exceed the approved maximum (retries and extra verifiers count);
- a model or effort goes up (`sonnet` to `opus`, or any effort to `max`);
- a role or step not in the plan is added (an unplanned arena, swarm, or interrogate).

Lowering effort, dropping an agent, or finishing with fewer agents needs no approval. A task that spawns no agents skips the plan. A new task, including "new task" mid-chat, needs a new plan.

## Precedence

The user's own instructions and saved memories come first, then this skill, then pstack, then Matt's skills. Where poteto-mode says to proceed without the human, keep the user's approval gates.

When you tell the user to type a skill, write `/pstack:<name>` or `/mattpocock-skills:<name>`.

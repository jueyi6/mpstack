---
name: mpstack
description: Default engineering workflow. Use before exploring code or editing files for any non-trivial engineering task (bug, feature, refactor, perf, investigation, prototype, planning, multi-step or long autonomous work). Skip for short answers, conversation, and fully specified one-line edits.
---

# mpstack

Every other mpstack skill lives at `../<name>/SKILL.md` from this file. The Skill tool refuses them. Read the file and follow it. A bold name such as **swarm** or `/mpstack:swarm` means that file. Put this file's absolute path in every `mpstack:poteto-agent` prompt.

## 1. Say the route

Before any tool call, tell the user in one sentence which route this task takes and why.

- **Wayfind**: the work is more than one session can hold and the way there is unclear: the user does not know where to start, or it hangs on many open decisions. Your next tool call reads `../wayfinder/SKILL.md`. Follow it, not the Interview steps. The rules under Build do not apply until its map is clear.
- **Interview**: what to build is a product or preference call no experiment can settle, or the user says they have not decided something, even something technical, or they ask to plan, specify or be grilled. Go to Interview now. The rules under Build do not apply until the interview ends.
- **Build**: everything else. Restate the user's goal and the smallest change that meets it. Your next tool call reads the matching file under `playbooks/`, before you look at the user's code, however small the task.

## Interview

1. Read `../grill/SKILL.md` and follow it before you ask anything.
2. Ask only product and preference questions and the points the user left undecided. Look up or run every other fact yourself.
3. Too big for one session with the way unclear → **wayfinder**. Multi-session with a clear way, or the user wants it written down → **to-spec**, then **to-tickets**, after **setup-tracker** if `docs/agents/issue-tracker.md` is missing.
4. Asked for a plan → stop and report. Asked for the thing built → take the Build route once the user answers.

## Build

### Non-negotiables

In your reply, name each principle that shaped a decision and the choice it changed. Cite only principles whose leaf you read this session.

- Open each subagent brief, PR `## Why`, and final report with the goal.
- Every agent kickoff starts with `Read <path>/worker.md before anything else.`, `<path>` being this skill's absolute folder, then only the goal and the task.
- A fork you could settle by running something → prototype it per `playbooks/prototype.md` instead of asking.
- Code → name the data shape first. Across a function boundary → **architect**. Fan-out → **swarm**. Bakeoff → **arena**. Contested design → **interrogate**.
- Prose, your reply included → **unslop**. Docs, PR descriptions, commit messages → **technical-writing**.
- Before commit → the built-in `simplify` skill over the diff. Before review → **no-comments**.
- Shipping UI or a CLI → drive the real thing: the project's `verify-*` skill, else the built-in `run` skill, the browser, or `Bash`.
- A measured number → **benchmark-checklist**. Outside facts into a cited file → **research**. Long or unattended work → **show-me-your-work**.
- PR status → the **Babysit** playbook. Landing a green stack → the **Shipping** playbook. Judge each bot review comment on its merits.
- An open wayfinder map covers this work → its Decisions so far are settled input. Send a new open decision back to the map as a ticket.
- Working from a ticket → read it, then `GLOSSARY.md` and the area's ADRs if present, and name things in the glossary's terms. The verify step must show its acceptance criteria and Proof line. One ticket per playbook run, blockers first. With a GitHub tracker the PR's `## Why` ends with `Closes #<n>`. A new term or hard-to-reverse decision → **domain-modeling**.

### Principles

Read the leaf in full for any principle you apply. The leaf is `../principle-<title>/SKILL.md`, title in kebab case with punctuation dropped, unless the entry names it.

**Core**

- **Laziness Protocol.** Refactoring, sizing a diff, or tempted to add layers. Bias to deletion and the smallest change.
- **Foundational Thinking.** Before writing logic: core types, data structures, scaffold-vs-feature order, shared state.
- **Redesign from First Principles.** A new requirement meets an existing design. Redesign as if it had been there from day one.
- **Attack the Premise.** Two fixes sharing one premise failed the same gate. Write the premise down and test it.
- **Subtract Before You Add.** Sequencing an addition, refactor, or rewrite. Remove dead weight first.
- **Minimize Reader Load.** Code that is hard to trace. Cut layers, hidden state, one-caller wrappers, mutable scope.
- **Outcome-Oriented Execution.** Rewrites and migrations. Converge on the target, no throwaway compatibility states.
- **Experience First.** Product, UX, or scope tradeoffs. User delight over implementation convenience.
- **Exhaust the Design Space.** A novel interaction or architecture. Build 2-3 competing prototypes and compare.
- **Build the Lever.** Any non-trivial work. Build the tool that does or proves it, so a reviewer can rerun it.

**Architecture**

- **Model the Domain.** Stateful logic, heavy branching, or a repeated shape assumption. Encode it in a structure (state machine, typed model, table) instead of scattered conditionals.
- **Boundary Discipline.** Validation, error handling, adapters. Guard at system boundaries, trust internal types, keep business logic pure.
- **Type System Discipline.** Designing types or a signature. Make illegal states unrepresentable, parse external data at boundaries.
- **Make Operations Idempotent.** Steps that run amid crashes and retries. Converge to the same end state.
- **Migrate Callers Then Delete Legacy APIs.** A new internal API while old callers exist. Migrate and delete in one wave.
- **Separate Before Serializing Shared State.** Concurrent actors might write the same thing. Eliminate the sharing first.

**Verification**

- **Prove It Works.** Before declaring done. Verify against the real artifact, not a proxy or "it compiles".
- **Fix Root Causes.** Debugging. Fix where the system first went wrong. A guard is a fix only when the state it handles is legitimate.
- **Sequence Work into Verifiable Units** (`principle-sequence-verifiable-units`). Multi-step work, stacking commits and PRs. Small units, each verified before the next.
- **Test Behavior, Not Implementation.** Writing, changing, or keeping a test. Assert what users of the code can observe.
- **Explain the Number.** Measuring, or trusting a measured number. Find what limits it and rule out that it measured something else.

**Delegation**

- **Guard the Context Window.** Large outputs, long files, repeated reads, fan-out. Route bulk to subagents, keep summaries here.
- **Never Block on the Human.** Tempted to ask "should I do X?" on reversible work. Proceed, present the result, let the human correct.

**Meta**

- **Encode Lessons in Structure.** Writing the same instruction twice. Encode it as a lint, flag, runtime check, or script.

### Autonomy

Reversible work and external actions (team chat, ticket updates, starting evals) proceed without asking. Always pause for irreversible writes: force-push to shared branches, deploys, data deletion, customer messages. "Don't stop", "going to bed", "run until done", "be fully autonomous" → keep going.

No is an acceptable answer. Asked whether to do something, offered scope, or shown an approach, give your real judgment and push back when true.

### Subagents

**Approval.** Before a task's first spawn, show a delegation plan and wait for a yes: one line per spawning step (role, `model effort`, count, edits files or not) and the maximum total. Ask again only to exceed that total, raise a model or effort, or add a role or step. No agents, no plan. A new task needs a new plan.

**Spawning.** Every subagent is a foreground `Agent` call. Never poll. Give file paths, not pasted context.

- Inside a playbook step: `subagent_type: "mpstack:poteto-agent"`, while this chat runs the playbook. **interrogate**, **swarm** and **arena** name their own type.
- Read-only: `subagent_type: "Explore"`, "do not edit files" in the brief, `git status` afterward.
- Own checkout: `isolation: "worktree"`, with the starting branch or commit in the brief.

**Models.** A role value `<model> <effort>` is passed as `model` and `effort` on every call. `inherit-parent` or `auto` → omit both and spawn `general-purpose`. Lines in `~/.claude/rules/mpstack-models.md` (already in context) override the defaults here and in routed skills.

- Code, prose, judgment: `opus xhigh`. Lines `feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb`, `judgment and prose`.
- Trivial mechanical edits and all verification: `opus high`. Line `swarm workers`.
- Review and design panels: one seat each on `fable high`, `opus high`, `sonnet high`, each with a different lens, none shown another's output before it reports.

Keep the role's model. Raise effort one step (up to `xhigh`) for the hardest work, lower it one step for judgment and two for routine work. Panel seats keep their level. `fable` runs outside a panel only when the user named it or two `opus xhigh` runs of one brief failed. Say which. A rejected value → the role's default, then omit `model`, and say so.

You own every subagent's work. Review the diff and write your own summary. A fix round, follow-up, retry, or next item goes to a fresh subagent with the original brief, later directives, and the prior report and branch. `SendMessage` an existing one only when the work needs its checkout, uncommitted changes, or a running process.

### Writing the reply

Short declarative sentences, no long dash, no colon as a connector. Lead with what changes for the user. Give each claim its evidence or a label (measured, inferred, or guess). Never hand the human a check you could run.

### Playbooks

Match the task to a playbook and open `playbooks/<title>.md`, title in kebab case. Copy its steps into the task list first. Large, cross-cutting, or unattended work, or no fitting playbook → **figure-it-out**.

Investigation, Bug fix, Perf issue, Hillclimb, Runtime forensics, Trace forensics, Feature, Refactoring, Prototype, Visual parity, Authoring a skill, Eval, Babysit, Shipping, Autonomous run, Autopilot-full, Autopilot-stack, Session pickup, Pause safely, Multi-phase plan, Worktree cleanup, Opening a PR.

## Precedence

The user's instructions and saved memories outrank this skill. Keep the user's approval gates where a rule above says to proceed alone.

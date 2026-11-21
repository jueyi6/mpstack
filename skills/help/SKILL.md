---
name: help
description: Answer questions about mpstack itself. Which skill or playbook fits a job, how to set it up, what it costs, why something did not run.
disable-model-invocation: true
---

# mpstack help

mpstack is one Claude Code plugin. It merges pstack (playbooks, principles, verification, review, PRs) with the planning skills from Matt Pocock's pack (interview, spec, tickets, glossary, research), rewritten for Claude models only.

This file maps questions to the files that hold the answers. Read the file you route to before you quote it, and trust it when it disagrees with this map. Answer in the user's words, give the one command to type, and stop.

## How it runs

- A session-start hook tells the agent to open `mpstack:mpstack` for every non-trivial engineering task. The user types nothing. `/mpstack:mpstack <task>` starts it by hand.
- That skill first says the route. **Wayfind** when the work is too big for one session and the way is unclear. **Interview** when what to build is still open. **Build** when it is settled, which matches a playbook.
- Only `mpstack:mpstack` is listed to the model. Every other skill is opened by the entry skill, or typed by the user as `/mpstack:<name>`.
- Before a task's first subagent the agent shows a delegation plan and waits for a yes.

## Setup

1. `/plugin marketplace add jueyi6/mpstack`, then `/plugin install mpstack@mpstack`.
2. Optional: `/mpstack:setup` picks a model and effort per role and writes `~/.claude/rules/mpstack-models.md`. Without it every role keeps its default. The rule applies to new sessions.
3. Optional, per repo: `/mpstack:setup-tracker` records where issues live. The spec and ticket skills need it.

If cost is the worry: subagents and review panels are where the tokens go. Rerun `/mpstack:setup` with a smaller budget, or set a role to `auto` so it runs on the session's model.

## Pick a skill

The default answer is `/mpstack:mpstack`, which runs most of the others when its steps need them. Name a skill directly when the user wants more or less than the playbook gives.

| The user wants to | Skill |
|---|---|
| Do any non-trivial task with rigor | [`/mpstack:mpstack`](../mpstack/SKILL.md) |
| Check that the agent understood their goal and the problem before it starts | [`/mpstack:in-your-own-words`](../in-your-own-words/SKILL.md) |
| Get a prompt rewritten deeper, not bigger, before sending it: what a top professional would add, their raw material and methods, and an outside check. It returns the prompt and doesn't do the task | [`/mpstack:sharpen`](../sharpen/SKILL.md) |
| Know how code works now, or where new code should live | [`/mpstack:how`](../how/SKILL.md) |
| Know why code is shaped this way, or where a number came from | [`/mpstack:why`](../why/SKILL.md) |
| Understand a change or subsystem, explained plainly | [`/mpstack:teach`](../teach/SKILL.md) |
| Catch up on their own recent work on a topic | [`/mpstack:recall`](../recall/SKILL.md) |
| Catch up on what changed in this chat since their last message, in plain words and small visuals, with every item waiting on them listed and decidable from the reply alone | [`/mpstack:ketchup`](../ketchup/SKILL.md) |
| Catch up like `/mpstack:ketchup`, in a short subtitled video of slides, with the waiting calls as text under it | [`/mpstack:ketchup-video`](../ketchup-video/SKILL.md) |
| Know what a small diff could break outside itself | [`/mpstack:blast-radius`](../blast-radius/SKILL.md) |
| Settle types and module shape before code that crosses a function boundary | [`/mpstack:architect`](../architect/SKILL.md) |
| Get several attempts at one brief, merged into the best one | [`/mpstack:arena`](../arena/SKILL.md) |
| Run parallel checks over slices, or race workers | [`/mpstack:swarm`](../swarm/SKILL.md) |
| Have different models review a diff and try to break it | [`/mpstack:interrogate`](../interrogate/SKILL.md) |
| Fix a bug test-first when a cheap local test exists | [`/mpstack:tdd`](../tdd/SKILL.md) |
| Apply TypeScript rules to `.ts` or `.tsx` work | [`/mpstack:typescript-best-practices`](../typescript-best-practices/SKILL.md) |
| Strip comments before review, using a reviewer that didn't write them | [`/mpstack:no-comments`](../no-comments/SKILL.md) |
| Clean AI tells out of prose | [`/mpstack:unslop`](../unslop/SKILL.md) |
| Write docs, an RFC, a README, a PR description, or a commit message to a standard | [`/mpstack:technical-writing`](../technical-writing/SKILL.md) |
| Hear the last reply again in plain words | [`/mpstack:bro`](../bro/SKILL.md) |
| Give agents a scripted way to drive the app and prove behavior | [`/mpstack:create-verification-skill`](../create-verification-skill/SKILL.md) |
| Bring a verification skill and its feature map back in line with the app | [`/mpstack:maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| Formally verify a race, invariant, or other property that tests rarely reach | [`/mpstack:create-formal-verification-skill`](../create-formal-verification-skill/SKILL.md) |
| Bring a formal verification back in line after the code it covers changed, and learn whether a failure is drift or a bug | [`/mpstack:maintain-formal-verification-skill`](../maintain-formal-verification-skill/SKILL.md) |
| Show a PM or designer what the user sees as a chart checked by a TLA+ model, with the shortest path to each state that breaks a rule | [`/mpstack:statechart`](../statechart/SKILL.md) |
| Vet a performance number before reporting or acting on it | [`/mpstack:benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| Run a large or cross-cutting change, or one to review after stepping away | [`/mpstack:figure-it-out`](../figure-it-out/SKILL.md) |
| Keep a decision log during a run, and review it afterward | [`/mpstack:show-me-your-work`](../show-me-your-work/SKILL.md) |
| Turn their own working habits into a personal mode skill | [`/mpstack:automate-me`](../automate-me/SKILL.md) |
| Turn what a finished task taught into skill edits | [`/mpstack:reflect`](../reflect/SKILL.md) |
| Stop agents from repeating the same mistakes in this repo | [`/mpstack:correct`](../correct/SKILL.md) |
| Decide what to build by being interviewed, one round of questions at a time | [`/mpstack:grill`](../grill/SKILL.md) |
| Plan work too big for one session as a map of decision tickets, resolved one per session | [`/mpstack:wayfinder`](../wayfinder/SKILL.md) |
| Write the agreed plan as a spec in the issue tracker | [`/mpstack:to-spec`](../to-spec/SKILL.md) |
| Split a spec or plan into tickets with blocking edges | [`/mpstack:to-tickets`](../to-tickets/SKILL.md) |
| Tell mpstack where this repo's issues and domain docs live | [`/mpstack:setup-tracker`](../setup-tracker/SKILL.md) |
| Keep a glossary and ADRs | [`/mpstack:domain-modeling`](../domain-modeling/SKILL.md) |
| Research outside sources into a cited file | [`/mpstack:research`](../research/SKILL.md) |
| Pick a model for each role and a reasoning budget | [`/mpstack:setup`](../setup/SKILL.md) |
| Port new upstream releases into mpstack (maintainers) | [`/mpstack:update-mpstack`](../update-mpstack/SKILL.md) |

If a skill directory next to this one is missing from the table, read its frontmatter and route by its description.

Close calls:

- `/mpstack:how` explains what the code does. `/mpstack:why` explains the reasons. `/mpstack:teach` runs one or both and explains the result plainly.
- `/mpstack:arena` gives every worker the same brief and merges the best parts. `/mpstack:swarm` splits work into slices or a race and returns one report.
- `/mpstack:interrogate` reviews the diff. `/mpstack:blast-radius` looks for breakage outside the diff.
- `/mpstack:recall` rebuilds context across recent sessions. `/mpstack:ketchup` covers only this chat since the user's last message. Resuming one chat or branch is the Session pickup playbook.
- `/mpstack:wayfinder` finds the way when the work is too big and unclear for one session and ends in decisions. `/mpstack:figure-it-out` executes a large change whose way is known. The Multi-phase plan playbook writes the PR plan.
- `/mpstack:grill` decides what to build. `/mpstack:in-your-own-words` only checks the agent understood a settled request.

## Playbooks and principles

The Playbooks section of [`mpstack`](../mpstack/SKILL.md) lists every playbook, and each lives at `../mpstack/playbooks/<title>.md`. Its Principles section lists the 24 principles and when each applies. Each leaf is `../principle-<title>/SKILL.md`.

mpstack has no planning mode of its own. Asking for a plan of phased work runs the Multi-phase plan playbook, which writes the plan and does not implement it.

## More

- [Prompting](references/prompting.md): how to word a request.
- [Recipes](references/recipes.md): common jobs end to end.

## When something looks wrong

| Symptom | Cause and fix |
|---|---|
| The agent did not open mpstack | The task looked trivial, or the plugin is disabled. Type `/mpstack:mpstack <task>`. Check `/plugin`. |
| A skill name is "not found" by the agent | Expected. The Skill tool refuses skills other than `mpstack:mpstack`. The agent reads `skills/<name>/SKILL.md` instead. |
| A new model choice had no effect | The rule from `/mpstack:setup` applies to new sessions. Start one. |
| The agent asked before spawning agents | That is the delegation plan. Answer once per task. |
| A step said "Skipped in Claude Code" | The upstream step needs a tool Claude Code lacks. The line says which. |

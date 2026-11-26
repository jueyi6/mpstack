# Changelog

## 2026-11-26: pstack 0.15.48

Upstreams: pstack 0.15.46 → 0.15.48 (`cursor/plugins` @ b1fbf4b6), Matt Pocock's skills 1.3.2 (`mattpocock/skills` @ 6f7f7831, no release).

- New skill `reframe` from pstack: teaches the expert words for what you are building, borrows terms from neighboring fields, checks every cited link, and rewrites your description. Run it with `/mpstack:reframe`. Listed in `help`.
- `domain-modeling`: glossary definitions bold the other glossary terms they mention and say how the two relate.
- Left out: pstack's guide page and README changes (mpstack carries no guide pages; the `help` row covers it). Matt's `chief-of-staff` changes (an unreleased `in-progress` skill).

## 2026-11-22: wayfinder, fused with pstack

`wayfinder` (Matt Pocock's skills 1.3.2) is now part of mpstack. The first release left it out as overlapping pstack's large-work skills. That was wrong: it plans by resolving decisions, which pstack has no skill for.

- The map, decision tickets, fog and frontier are kept as upstream wrote them.
- Tickets are resolved with pstack's tools: `research` tickets use `research`, `how` or `why`. `prototype` tickets run the Prototype playbook. One-way-door shapes go through `architect`. Every answer carries its evidence label.
- HITL tickets are the user's call. AFK tickets proceed without asking. Research fan-out goes through the delegation plan.
- Arrival hands the route to `to-spec` and `to-tickets`, `figure-it-out`, or the Multi-phase plan playbook, with the map's decisions as settled input.
- pstack's side points back: `figure-it-out`, Multi-phase plan and Session pickup read an existing map and send unsettled large work to `wayfinder`.
- The tracker templates regain their "Wayfinding operations" sections.

## 2026-11-22: first merged release

Upstreams: pstack 0.15.46 (`cursor/plugins` @ 792440e8, tree `harness/pstack/claude-code`), Matt Pocock's skills 1.3.2 (`mattpocock/skills` @ abeeaf95).

mpstack is now self-contained. The earlier design, a thin plugin that routed between two separately installed plugins, is gone.

From pstack, ported to Claude Code:

- Every skill except `make-bot-ui` (it targets a Grok bot). `poteto-mode` became `mpstack`, `poteto-help` became `help`, `setup-pstack` became `setup`.
- Agents `poteto-agent` and `comment-sicko`.
- Dropped: the harness adapter and the guide pages (their content is now in the skills), guide images, the statechart test corpus.
- Rewritten by hand: `mpstack` (entry), `help`, `setup`. Edited by hand: `arena`, `swarm`, `how`, `recall`, `shipping`, `autopilot-full`, `worktree-cleanup`, `automate-me`, `authoring-a-skill`, `eval`, `session-pickup`, `show-me-your-work`, the review-bot triage reference.

From Matt Pocock's skills:

- `grilling` and `grill-with-docs` → `grill`. Facts are looked up directly. `domain-modeling` loads only when a term or decision is written down.
- `domain-modeling`, `to-spec`, `to-tickets`, `research`, `setup-matt-pocock-skills` → `setup-tracker`.
- Triage labels and the wayfinder sections are removed. Tickets gain a Proof line that the build's verify step must show.
- Not taken, because pstack owns the job: `tdd`, `diagnosing-bugs`, `prototype`, `codebase-design`, `code-review`, `pr`, `writing-for-agents`, and the rest.

New in mpstack: the route step (Interview or Build) ahead of everything else, the delegation plan, `tools/check.mjs`, `tools/upstream.mjs`, the `update-mpstack` runbook.

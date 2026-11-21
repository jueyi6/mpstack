# Changelog

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

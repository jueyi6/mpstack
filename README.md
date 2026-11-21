# mpstack for Claude Code

One plugin that merges two skill packs into a single engineering workflow for Claude Code.

- [pstack](https://github.com/cursor/plugins) by Lauren Tan supplies the work: 22 playbooks, 24 principles, verification, review panels, PR handling.
- [Matt Pocock's skills](https://github.com/mattpocock/skills) supply the planning pstack has no skill for: the interview, the spec, the tickets, the glossary and ADRs, cited research.

The two are merged into this repository's files and rewritten for Claude models only. You install mpstack and nothing else.

## Install

Requires Claude Code and Node.js.

```
/plugin marketplace add jueyi6/mpstack
/plugin install mpstack@mpstack
```

Optional: `/mpstack:setup` picks a model and effort per role. Without it every role keeps its default.

If you already have pstack or Matt Pocock's skills installed as plugins, uninstall them. mpstack carries its own copy, and two copies of the same skill names confuse routing.

## Use

Ask for engineering work as usual. A session-start hook sends every non-trivial task through the `mpstack:mpstack` skill, which first says which route it takes.

- **Interview.** What to build is still open, or you say you have not decided. It asks one round of questions at a time, each with a recommended answer, and looks up facts itself. For work that spans sessions it then writes a spec and tickets.
- **Build.** What to build is settled. It matches a playbook (bug fix, feature, refactoring, perf issue, investigation, prototype, and 16 more) and follows it through verification.

`/mpstack:mpstack <task>` starts it by hand. `/mpstack:help` answers questions about mpstack itself. Every skill can be typed as `/mpstack:<name>`.

## How the merge was done

- **pstack first.** Where the packs overlap (tests, bug diagnosis, prototypes, design, review, PR text), pstack's skill is the one that ships. Matt's overlapping skills are left out.
- **Claude only.** Every agent runs on a Claude model. Other vendors' models, Cursor-only tools and Cursor paths are replaced with what Claude Code has. Review panels vary the lens per seat because every seat is the same vendor.
- **Small at session start.** Only the entry skill is listed to the model. The other 63 are opened by path when a step needs them. The entry skill is held under a size budget by `tools/check.mjs`.
- **Delegation plan.** Before a task's first subagent the agent shows what it will spawn and waits for one yes.

## Layout

| Path | Purpose |
| --- | --- |
| `skills/mpstack/` | The entry skill, its playbooks, `worker.md`, PR scripts. |
| `skills/<name>/` | Every other skill, opened by the entry skill or typed by the user. |
| `agents/` | `poteto-agent` (delegate) and `comment-sicko` (comment review). |
| `hooks/` | The session-start hook. |
| `UPSTREAM.json` | The upstream versions and commits this tree was merged from. |
| `tools/upstream.mjs` | Read-only check: what changed upstream since the pins. |
| `tools/check.mjs` | Lint: frontmatter, links, skill references, wording, entry size. |
| `tools/port.py` | The mechanical substitutions, as an aid for a hand port. |

## Updating

mpstack does not follow its upstreams automatically. A maintainer ports new releases by hand with the runbook in `skills/update-mpstack/SKILL.md`: see what changed (`node tools/upstream.mjs`), merge it by meaning, run `node tools/check.mjs`, smoke-test, push. `CHANGELOG.md` records each port. The plugin has no `version` field, so every commit on `main` is a release, and Claude Code picks it up when marketplace auto-update is on.

## Credits and license

pstack is © Lauren Tan and Matt Pocock's skills are © Matt Pocock, both MIT. Their license texts are in `licenses/`. The merge, the rewrites and the tools are © jueyi6, MIT. See `LICENSE`.

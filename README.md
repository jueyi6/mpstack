# mpstack for Claude Code

mpstack joins two skill packs into one workflow for Claude Code.

- [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan runs the work: playbooks, principles, verification, review, PRs.
- [Matt Pocock's skills](https://github.com/mattpocock/skills) fill the planning steps pstack leaves out: the interview, the spec, the tickets, the glossary and ADRs.

Neither pack is copied or patched. Both install as their own plugins and update on their own. mpstack holds only the join, so there is nothing to re-port when an upstream ships a release.

## What it adds

- **Automatic entry.** A session-start hook sends every non-trivial engineering task through the `mpstack:mpstack` skill. No slash command to remember.
- **pstack first.** Where the two packs overlap (tests, bug diagnosis, prototypes, design, review, PR bodies, large efforts), pstack owns the step. Matt's skills run only for the jobs pstack has no skill for.
- **Claude only.** Every agent runs on a Claude model. Other vendors' models and Cursor-only tools named in pstack are mapped to what Claude Code has.
- **Drift check.** Each session start checks that both packs still ship what mpstack routes to, that no skill names collide, and that no pack is installed twice. It reports upstream version changes in one line.

## Install

Requires Claude Code and Node.js.

```
/plugin marketplace add cursor/plugins
/plugin install pstack@cursor-plugins
/plugin marketplace add mattpocock/skills
/plugin install mattpocock-skills@mattpocock
/plugin marketplace add jueyi6/mpstack
/plugin install mpstack@mpstack
```

Turn on auto-update for all three marketplaces in `/plugin` → Marketplaces. Then run `/pstack:setup-pstack` once to choose a model and effort per role. It writes `~/.claude/rules/pstack-models.md`.

Remove any other copy of pstack or of Matt's skills first, including copies in `~/.claude/skills`. The health check reports them.

## Use

Ask for engineering work as usual. mpstack picks the route:

- What to build is still open, or you say you have not decided → Matt's interview, then a spec and tickets when the work spans sessions.
- What to build is settled → the pstack playbook that fits.

`/mpstack:mpstack <task>` starts it by hand. `/mpstack:doctor` runs the health check.

## Layout

| Path | Purpose |
| --- | --- |
| `skills/mpstack/SKILL.md` | The join: load order, the ownership tables, the Claude-only substitutions. |
| `skills/doctor/SKILL.md` | Runs the health check and says how to fix what it finds. |
| `scripts/doctor.mjs` | The health check. The lists at its top name every upstream file and skill mpstack depends on. |
| `hooks/session-start.mjs` | Injects the routing, both install paths, and any problem or upstream change. |

## Maintaining it

Edit, commit, push. The plugin has no `version` field, so every commit on `main` is an update.

When an upstream renames or removes a skill, the health check names it. Fix the name in `skills/mpstack/SKILL.md` and in the lists at the top of `scripts/doctor.mjs`.

## Credits

pstack is by Lauren Tan and Matt Pocock's skills are by Matt Pocock, both MIT licensed. mpstack ships none of their files. The approach of leaving both packs unmodified and joining them from outside follows [moedesux/pocoteto-skills](https://github.com/moedesux/pocoteto-skills).

## License

MIT

---
name: update-mpstack
description: Maintainer runbook. Port new pstack and Matt Pocock skills releases into mpstack by hand. Use for "mpstack 업데이트", "update mpstack".
disable-model-invocation: true
---

# Update mpstack

mpstack is a hand-merged copy of two upstreams, pinned in `UPSTREAM.json` at the repo root. An update ports what changed upstream since the pins. Nothing is generated. Work in a clone of the mpstack repo, not in the plugin cache.

## 1. See what changed

Run `node tools/upstream.mjs`. It compares each pin with the upstream default branch and prints the changed files that mpstack tracks, each with the mpstack path it lands in. "Up to date" for both → report that and stop.

## 2. Port each change

For every listed file, read the upstream diff (`node tools/upstream.mjs --diff <upstream path>`) and apply its meaning to the mpstack file by hand.

- **Skill bodies ported from pstack** (most of `skills/`): apply the diff, then make the new text Claude-native. `tools/port.mjs` holds the mechanical substitutions (tool names, model values, paths, skill prefixes) and can be run on a fresh checkout into a scratch folder to see what a mechanical port gives. Never overwrite the repo with its output.
- **Hand-written files**: `skills/mpstack/SKILL.md`, `skills/help/SKILL.md`, `skills/setup/SKILL.md`, `skills/grill/SKILL.md`, `skills/research/SKILL.md`, `skills/setup-tracker/SKILL.md`. Upstream changes to their sources (`poteto-mode`, `poteto-help`, `setup-pstack`, `grilling`, `grill-with-docs`, `research`, `setup-matt-pocock-skills`) are merged by meaning. Keep these files short.
- **New upstream skill**: pstack → port it. Matt → take it only if it does a job pstack has no skill for, and say so in the report. Add it to `UPSTREAM.json` and to the table in `skills/help/SKILL.md`.
- **Removed or renamed upstream skill**: do the same here and fix every reference.

Rules that every port keeps:

- Claude only. No other vendor's model, no Cursor-only tool. A step with no Claude Code equivalent becomes `Skipped in Claude Code: <step>. <reason>.`
- pstack wins. Where a Matt skill overlaps a pstack skill or playbook, the pstack one stays and the Matt text is dropped.
- Only `mpstack` is model-invocable. Every other skill carries `disable-model-invocation: true` and is reached by path.
- In `skills/mpstack/SKILL.md` the route sentence comes before any tool call, and the Interview route does not apply the Build rules first.
- Cut filler. A sentence that repeats another file is replaced by a pointer to it.

## 3. Check

1. `node tools/check.mjs` passes.
2. Set the new `version` and `commit` in `UPSTREAM.json` and add a dated entry to `CHANGELOG.md`: upstream versions, what was ported, what was left out and why.
3. In a scratch git repo with the working copy loaded (`claude --plugin-dir <clone>`), run both smoke prompts three times each: an undecided feature must take the Interview route and read `grill`, a bug fix must take the Build route and open `playbooks/bug-fix.md`.

## 4. Ship

Commit and push to `main`. The plugin has no `version` field, so the commit is the release. Report to the user: upstream versions before and after, what changed for them, anything skipped.

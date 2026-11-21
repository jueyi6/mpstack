---
name: setup
description: Configure which Claude model and effort mpstack uses per role. Writes an always-loaded rule that overrides the skill defaults. Use for /mpstack:setup, "configure mpstack models", "mpstack budget".
disable-model-invocation: true
---

# Set up mpstack models

Write `~/.claude/rules/mpstack-models.md`. Claude Code loads it into every session, and its role lines override mpstack's defaults.

A value is `<model> <effort>`. `model` is `opus`, `sonnet`, `haiku`, or `fable`, an alias that always resolves to the newest version. `effort` is `low`, `medium`, `high`, or `xhigh`. `inherit-parent` or `auto` runs the role on the session's model.

## 1. Read the current rule

If the file exists, read it and treat its `# budget` line and role values as the current choices. Keep its comment lines. A role not in the shape below is retired: drop the line and tell the user. If `~/.claude/rules/pstack-models.md` exists and the new file does not, offer to carry its lines over.

## 2. Budget

Ask with `AskUserQuestion`, naming the current budget when the rule records one.

- `large (xhigh reasoning)`: the defaults below.
- `medium (high reasoning)`: every role one effort step lower.
- `small (medium reasoning)`: every role two steps lower.

The ladder is `xhigh` > `high` > `medium` > `low`. A role at the bottom stays there. On a re-run keep any role whose model the user changed and move only its effort.

## 3. Show and confirm

Show every role with its value. Ask whether to accept or change specific roles. Panel roles (`arena runners`, `interrogate reviewers`) are lists, and one agent runs per entry, so the list length sets the count. `arena cross-judge pool` is an ordered list from which Arena runs one judge, the first entry whose model differs from the session's. Keep at least two different models in each panel list so the second opinion comes from another model.

## 4. Write the rule

Write the file with the user's own comment lines first, then this shape. Tell the user it applies to new sessions.

```
# mpstack model configuration. One line per role. Delete a line to fall back to the skill default.
# Values are `<model> <effort>`, passed as Agent `model` and `effort`. `inherit-parent` or `auto`: the role runs on the session's model.
# defaults: 3
# budget: large (xhigh)
feature, refactoring: opus xhigh
bug-fix: opus xhigh
perf-issue: opus xhigh
hillclimb: opus xhigh
judgment and prose: opus xhigh
arena runners: fable high, opus high, sonnet high
arena cross-judge pool: opus high, sonnet high
swarm workers: opus high
interrogate reviewers: fable high, opus high, sonnet high
```

## 5. Offer verification skills

Each offer is made once, and a no ends it.

- The project has no way to drive the real app for proof (no `verify-*` skill or harness) → offer **create-verification-skill**.
- The project has no formal verification skill → offer **create-formal-verification-skill**.

On yes, read `../<name>/SKILL.md` and follow it.

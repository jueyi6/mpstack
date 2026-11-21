---
name: doctor
description: Check that pstack and Matt Pocock's skills are installed, still ship what mpstack routes to, and do not collide.
disable-model-invocation: true
---

# mpstack doctor

1. Run `node ../../scripts/doctor.mjs` from this skill's base directory and show the user its output.
2. For each problem, say what it means for the user. Fix it when the fix is inside mpstack or the user's own config.
3. A renamed or removed upstream skill, or a changed adapter, means `skills/mpstack/SKILL.md` and the constants at the top of `scripts/doctor.mjs` need updating.

mpstack's source is its GitHub repository. Change it in the user's clone, commit, and push. Ask where the clone is if you do not know. Never edit files under `~/.claude/plugins/cache/`.

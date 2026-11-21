---
name: doctor
description: Check that pstack and Matt Pocock's skills are both installed, still ship what mpstack routes to, and do not collide. Use for /mpstack:doctor, "is mpstack healthy", or when behaviour changes following an upstream update.
---

# mpstack doctor

1. Run `node ../../scripts/doctor.mjs` from this skill's base directory and show the user its output.
2. For each problem it lists, say what it means for the user. Fix it when the fix is inside mpstack or the user's own config.
3. A renamed or removed upstream skill means `skills/mpstack/SKILL.md` and the lists at the top of `scripts/doctor.mjs` need the new name.

mpstack's source is its GitHub repository. Make changes in the user's clone of it, commit, and push. The installed copy updates from there. Ask the user where the clone is if you do not know.

Never edit files under `~/.claude/plugins/cache/`. The next update overwrites them.

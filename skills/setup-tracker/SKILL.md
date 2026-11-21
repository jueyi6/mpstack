---
name: setup-tracker
description: Configure this repo for the spec and ticket skills. Records where issues live and where the glossary and ADRs live. Run once per repo.
disable-model-invocation: true
---

# Set up the tracker

Write the per-repo files that **to-spec**, **to-tickets**, **wayfinder**, and ticket-driven builds read. Explore, present what you found, confirm, then write.

## 1. Explore

- `git remote -v`: GitHub, GitLab, or no remote.
- `CLAUDE.md` and `AGENTS.md` at the root, and any `## Agent skills` section in them.
- `GLOSSARY.md`, `GLOSSARY-MAP.md`, `docs/adr/`, any `src/*/docs/adr/`.
- `docs/agents/`: this skill's earlier output.
- `.scratch/`: a local markdown tracker already in use.
- Monorepo signals: `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or populated `packages/*`.

## 2. Ask

Lead each section with the recommended answer so the user can accept it in a word. Skip a section exploration already settled.

**Issue tracker.** A remote on GitHub → propose GitHub (`gh`). On GitLab → GitLab (`glab`). No remote → local markdown under `.scratch/<feature>/`. Another tracker (Jira, Linear) → have the user describe the workflow in a paragraph and record it as prose.

A GitHub or GitLab tracker needs a reachable repo. Done when `gh repo view` or `glab repo view` prints the project from this directory. If it cannot, stop and say what is missing.

**Domain docs.** Default to single-context (one `GLOSSARY.md` and `docs/adr/` at the root) and write it without asking. Offer multi-context (a root `GLOSSARY-MAP.md` pointing to per-context glossaries) only when exploration found monorepo signals.

## 3. Confirm

Show a draft of the `## Agent skills` block and of `docs/agents/issue-tracker.md` and `docs/agents/domain.md`. Let the user edit before you write.

## 4. Write

Edit `CLAUDE.md` if it exists, else `AGENTS.md`, else create `CLAUDE.md`. Update an existing `## Agent skills` block in place and leave the surrounding sections alone.

```markdown
## Agent skills

### Issue tracker

[one line on where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Domain docs

[single-context or multi-context]. See `docs/agents/domain.md`.
```

Write the docs from the seed templates in this folder: [issue-tracker-github.md](./issue-tracker-github.md), [issue-tracker-gitlab.md](./issue-tracker-gitlab.md), [issue-tracker-local.md](./issue-tracker-local.md), [domain.md](./domain.md). For another tracker, write `docs/agents/issue-tracker.md` from the user's description.

## 5. Done

Say which files were written and that they can be edited by hand. Rerun this skill only to switch trackers.

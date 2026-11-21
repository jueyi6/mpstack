---
name: grill
description: Interview the user about a plan, decision, or idea until every open decision is settled. Use when what to build is undecided, or the user asks to be grilled.
disable-model-invocation: true
---

Interview the user until you reach a shared understanding. Map the work as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are settled, the questions you can ask now without guessing at answers you have not heard. Ask the whole frontier in one round. Number each question and give your recommended answer. Then wait.

```
❓ **Q1** - **<question title>**: <question body, with choices where they help>

➡️ <your recommended answer>

---

❓ **Q2** - ...
```

Word each question so "yes" accepts your recommendation. A question whose answer depends on one still open in this round belongs to a later round. After each round recompute the frontier and ask again.

Facts are your job, never the user's. Look up or run anything the repo or tools can answer before you ask, with `Read`, `Grep`, or `Bash` directly. Use one read-only `Explore` agent only when a fact needs a wide search, and ask the rest of the frontier while it runs. Decisions are the user's. Put each to them and wait.

In a repo, hold the user to its language. If `GLOSSARY.md` exists, read it first and call out a term used against its definition. Check what the user says about the code against the code. Only when a term is resolved or a decision is hard to reverse, read `../domain-modeling/SKILL.md` and record it.

The interview is done when the frontier is empty and nothing is silently assumed. Do not act on it until the user confirms.

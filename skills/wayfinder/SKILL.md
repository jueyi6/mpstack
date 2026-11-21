---
name: wayfinder
description: Plan work too big for one session as a shared map of decision tickets on the issue tracker. Resolve them one at a time with mpstack's own tools (grill, prototype, research, how, architect) until the way is clear, then hand the route to a build playbook.
disable-model-invocation: true
---

# Wayfinder

A loose idea has arrived, too big for one agent session and wrapped in fog: the way from here to the **destination** is not visible yet. Wayfinding finds that way. It does not charge at the destination. It charts the way as a **shared map** on the repo's issue tracker, then works its **decision tickets** one at a time until the route is clear. A decision ticket is a question whose resolution is a decision, not a slice of a build.

Every other mpstack skill lives at `../<name>/SKILL.md`. Playbooks live at `../mpstack/playbooks/<title>.md`.

The destination varies per effort, and naming it is the first act of charting. It might be a spec to hand off, a decision to lock before planning, or a change made in place such as a data-structure migration.

## Plan, don't do

Each ticket resolves a decision, and the map is done when nothing is left to decide before someone builds. The pull to just do the work is the signal you have reached the edge of the map: go to [Arrival](#arrival). An effort can override this in its **Notes**. Absent that, produce decisions, not deliverables.

## Who decides

The Build rules of **mpstack** hold here with one change. A **HITL** ticket is the user's decision: put it to them and wait, however reversible it looks. An **AFK** ticket is yours: proceed without asking, as Never Block on the Human says. Never answer a HITL ticket for the user.

## The map

The map is one issue labelled `wayfinder:map`. Its tickets are child issues. Read `docs/agents/issue-tracker.md`, section "Wayfinding operations", for how this repo creates the map, links children, sets blocking, queries the frontier, claims and resolves. With no tracker doc, run **setup-tracker** first, choosing local markdown when there is no remote.

The map is an index, not a store. A decision lives in one place, its ticket. The map gists it in one line and links. In everything the user reads, name a ticket by its title, with the link inside the name, never by a bare number.

```markdown
## Destination

<what reaching the end looks like: the spec, decision, or change. One or two lines.>

## Notes

<domain, skills every session should read, standing preferences for this effort>

## Decisions so far

- [<closed ticket title>](link): <one-line answer> (<measured | inferred | guess>)

## Not yet specified

<fog: questions you can tell are coming but cannot state sharply yet>

## Out of scope

<work ruled beyond the destination, one line each with why>
```

Open tickets are not listed in the body. They are open child issues, found by query. For a wayfinder effort the map is the decision log, so **show-me-your-work** adds no second log for the planning.

## Tickets

A ticket body is the question, sized to one session:

```markdown
## Question

<the decision or investigation this ticket resolves>
```

Each ticket carries one `wayfinder:<type>` label and no other label. Blocking uses the tracker's native dependency link so the user sees the frontier in the tracker's own UI. A ticket is unblocked when every blocker is closed. The **frontier** is the open, unblocked, unclaimed children. A session **claims** a ticket by assigning it, before any work, so parallel sessions skip it.

| Type | Who | Resolve it with |
| --- | --- | --- |
| `research` | AFK | A fact a decision waits on. Outside the repo → **research**. What the code does now → **how**. Why it is shaped this way → **why**. |
| `prototype` | HITL | "How should it look or behave" is the question. Run the Prototype playbook: throwaway variants behind one switcher, the user picks. Link the artifact from the ticket. |
| `grilling` | HITL | Conversation, the default. Run **grill**. A term resolved or a hard-to-reverse choice → **domain-modeling**. |
| `task` | AFK or HITL | Manual work a decision waits on: an account, access, data moved so its shape can be seen. Reversible → do it. Irreversible or yours alone to do → hand the user an exact checklist. The answer records what was done and the facts later tickets need. |

Two rules cut across the types.

- A fork you could settle by running something is a `prototype` or `research` ticket, not a `grilling` one. Never ask the user what an experiment can answer.
- A one-way-door technical shape (a schema, a public interface, a protocol) → run **architect** before you put a recommendation to the user. A recommendation the user doubts → **interrogate** it.

Every answer states its evidence or a label: measured, inferred, or guess. A guess that later tickets build on gets its own `research` or `prototype` ticket.

## Fog and scope

The map is deliberately incomplete. Do not chart what you cannot see yet. **Not yet specified** holds the dim view: the suspected question, the area to revisit. Resolving a ticket clears the fog ahead of it, and whatever is now specifiable graduates into tickets.

- **Ticket** when you can state the question precisely now, even if it is blocked.
- **Not yet specified** when you cannot. Do not pre-slice fog into ticket-sized pieces.
- **Out of scope** when the work lies beyond the destination. It is not fog and never graduates. A ticket that turns out to sit past the destination is closed, with one line under Out of scope saying why. It stays out of Decisions so far.

## Chart the map

The user arrives with a loose idea. Charting is one session and hand-resolves nothing.

1. **Name the destination** with **grill**. It fixes the scope, so it is settled first.
2. **Map the frontier.** Grill again, breadth-first: fan out across the whole space, surfacing the open decisions and the steps takeable now. Look up every fact the repo can answer before you ask. If this surfaces no fog, you do not need a map. Say so and take the Build route, or **to-spec**.
3. **Create the map**: Destination and Notes filled in, Decisions so far empty, the fog sketched under Not yet specified.
4. **Create the tickets you can state now** as children, then wire blocking edges and cross-references in a second pass, once the issues have ids.
5. **Start the research.** The `research` tickets are the only ones that fan out. List them in the delegation plan (one `general-purpose` agent each on the `judgment and prose` value, none edits product code), and on yes spawn them together. Each saves its findings where **research** says and links the file from its ticket.
6. Stop and report: the map, the frontier, the fog.

## Work through the map

The user arrives with a map. Resolve one ticket per session. Research tickets are the exception.

1. Load the map body, not every ticket.
2. Choose the ticket the user named, else the first on the frontier. Claim it before any work.
3. Resolve it as its label says. Fetch the body of a related or closed ticket only when you need its detail. Read the skills the map's Notes name.
4. Record it: post the answer as a resolution comment, close the ticket, and add its line to Decisions so far.
5. Redraw: create and wire tickets the answer surfaced, graduate fog it made specifiable, close what it put out of scope. If it overturns an earlier decision, reopen that as a new ticket and fix the map. Do not patch around it (Attack the Premise).

Other sessions may be editing the tracker at the same time.

## Arrival

The way is clear when the frontier and the fog are both empty. Do not build inside the map. Hand the route to the tool that fits the destination, and tell it the map's Decisions so far are settled input, not questions to reopen.

- A spec → **to-spec**, then **to-tickets**. Each build ticket then takes one Build playbook run.
- A large or cross-cutting change made in place → **figure-it-out**. Its Phase A frame is read off the map.
- A stack of PRs → the Multi-phase plan playbook.
- A single decision → report it, and record it with **domain-modeling** if it is hard to reverse.

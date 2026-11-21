import { inspect, changesSinceLastRun, MATT_UNUSED_BY_MODEL } from "../scripts/doctor.mjs";

let context;
try {
  const report = inspect();
  const notes = changesSinceLastRun(report);
  const lines = [
    "mpstack is this user's default engineering workflow in Claude Code. pstack's poteto-mode runs the work, and Matt Pocock's skills fill only the planning steps pstack lacks.",
    "Before exploring code or editing files for any non-trivial engineering task (bug fix, feature, refactor, perf, investigation of how or why code works, prototype, planning or specifying a feature, multi-step change, long autonomous run), invoke the Skill `mpstack:mpstack` first and follow it.",
    "Skip it only for short answers, pure conversation, and an edit the user fully specified. A bug to find, a test to write, or anything you must investigate first is not a skip. When unsure, invoke it.",
    `mpstack paths this session: <pstack> = ${report.pstackRoot ?? "not installed"} and <matt> = ${report.mattRoot ?? "not installed"}.`,
    `Where the two packs overlap, pstack wins. Do not invoke ${MATT_UNUSED_BY_MODEL.map((name) => `\`mattpocock-skills:${name}\``).join(", ")} on your own. pstack owns those jobs. Use one only when the user names it.`,
  ];
  if (report.collisions.length) {
    lines.push(
      `Both packs now let the model invoke these names: ${report.collisions.join(", ")}. Always call them with the plugin prefix.`,
    );
  }
  if (report.problems.length) {
    lines.push(`mpstack health check found problems. Tell the user at the start of your next reply: ${report.problems.join(" ")}`);
  }
  if (notes.length) {
    lines.push(`Upstream changed since the last session. Mention it to the user in one line: ${notes.join(" ")}`);
  }
  lines.push("The user's own instructions and saved memories outrank mpstack.");
  context = lines.join(" ");
} catch (error) {
  context = `mpstack's session hook failed (${error.message}). Tell the user, and for engineering tasks still invoke the Skill \`mpstack:mpstack\`.`;
}

process.stdout.write(
  JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } }),
);

import { inspect, changesSinceLastRun } from "../scripts/doctor.mjs";

let context;
try {
  const report = inspect();
  const notes = changesSinceLastRun(report);
  const lines = [
    "mpstack is this user's engineering workflow. Before exploring code or editing files for any non-trivial engineering task (bug, feature, refactor, perf, investigation, prototype, planning, multi-step or long autonomous work), invoke the Skill `mpstack:mpstack` and follow it.",
    "Skip it only for short answers, conversation, and an edit the user fully specified. Anything you must investigate first is not a skip. When unsure, invoke it.",
    `mpstack paths: <pstack> = ${report.pstackRoot ?? "not installed"}, <matt> = ${report.mattRoot ?? "not installed"}.`,
    "Never invoke a `mattpocock-skills:` skill on your own. Use one only when mpstack routes there or the user names it.",
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
  context = lines.join(" ");
} catch (error) {
  context = `mpstack's session hook failed (${error.message}). Tell the user, and for engineering tasks still invoke the Skill \`mpstack:mpstack\`.`;
}

process.stdout.write(
  JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } }),
);

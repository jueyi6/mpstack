const context = [
  "mpstack is this user's engineering workflow. Before exploring code or editing files for any non-trivial engineering task (bug, feature, refactor, perf, investigation, prototype, planning, multi-step or long autonomous work), invoke the Skill `mpstack:mpstack` and follow it.",
  "Your first tool call for such a task is that Skill call. Skip it only for questions, conversation, and a single edit whose exact text the user gave. A bug fix or a change you must investigate or test is never a skip, however small or well described. When unsure, invoke it.",
].join(" ");

process.stdout.write(
  JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } }),
);

"""First-pass port of upstream text into mpstack's vocabulary.

A maintainer aid, not a build step. It applies only the mechanical renames
(tool names, model slugs, paths, skill names). Everything it writes is then
read and finished by hand, and the committed files are the source of truth.

  python tools/port.py <pstack-claude-code-tree> <mattpocock-skills-repo> <out-dir>
"""
import os, re, shutil, sys

PSTACK_SKIP = {"make-bot-ui"}
PSTACK_RENAME = {"poteto-mode": "mpstack", "poteto-help": "help", "setup-pstack": "setup"}
MATT_TAKE = {
    "productivity/grilling": "grill",
    "engineering/domain-modeling": "domain-modeling",
    "engineering/to-spec": "to-spec",
    "engineering/to-tickets": "to-tickets",
    "engineering/setup-matt-pocock-skills": "setup-tracker",
    "engineering/research": "research",
}
SKIP_PATHS = ("statechart/scripts/test/",)
TEXT = (".md", ".ts", ".sh", ".json", ".mjs", ".js", ".yaml", ".yml", ".tla", ".mmd", ".dot", "")

ADAPTER_LINE = re.compile(
    r"In Claude Code, read \[the Claude Code adapter\]\([^)]*\) once per session before you follow this skill\. "
    r"It maps the Cursor names in pstack skills to Claude Code\.\n\n?"
)
SIBLINGS = "Other mpstack skills live at `../<name>/SKILL.md`. Read one to run it.\n\n"

SLUGS = [
    ("claude-opus-5-5-xhigh-fast", "opus xhigh"),
    ("claude-opus-5-5-high-fast", "opus high"),
    ("claude-opus-5-5-medium-fast", "opus medium"),
    ("claude-opus-5-5-low-fast", "opus low"),
    ("claude-fable-5-2-high", "fable high"),
    ("gemini-4-neon-xhigh", "sonnet high"),
]
PLAIN = [
    ("~/.cursor/rules/pstack-models.mdc", "~/.claude/rules/mpstack-models.md"),
    ("pstack-models.mdc", "mpstack-models.md"),
    ("`AskQuestion`", "`AskUserQuestion`"),
    ("AskQuestion", "AskUserQuestion"),
    ("generalPurpose", "general-purpose"),
    ("`Task`", "`Agent`"),
    ("Task tool", "Agent tool"),
    ("Task call", "Agent call"),
    ("Task spawn", "Agent spawn"),
    ("Task subagent", "subagent"),
    ("`poteto-agent`", "`mpstack:poteto-agent`"),
    ("`comment-sicko`", "`mpstack:comment-sicko`"),
    ("~/.cursor/skills/", "~/.claude/skills/"),
    (".cursor/skills/", ".claude/skills/"),
    ("~/.cursor/plugins/", "~/.claude/plugins/"),
    (".cursor-plugin/plugin.json", ".claude-plugin/plugin.json"),
    ("Cursor's `/loop` command", "Claude Code's `/loop` command"),
    ("`/deslop` from the `cursor-team-kit` plugin", "the built-in `simplify` skill (`/simplify`)"),
    ("`/deslop` from `cursor-team-kit`", "the built-in `simplify` skill (`/simplify`)"),
]
FRONTMATTER_DROP = re.compile(r"^(icon|color|mode|reminder|is_background|argument-hint):.*\n", re.M)


def port_text(text, names, is_skill_md, adapter_note):
    text = ADAPTER_LINE.sub(SIBLINGS if adapter_note else "", text)
    for old, new in SLUGS + PLAIN:
        text = text.replace(old, new)
    for old, new in PSTACK_RENAME.items():
        text = re.sub(rf"(?<![\w-]){re.escape(old)}(?![\w-])", new, text)
    text = re.sub(r"(?<![\w/:.`-])/(%s)(?![\w-])" % "|".join(sorted(map(re.escape, names), key=len, reverse=True)), r"/mpstack:\1", text)
    text = re.sub(r"`/(%s)`" % "|".join(sorted(map(re.escape, names), key=len, reverse=True)), r"`/mpstack:\1`", text)
    text = re.sub(r"(?<![\w/.-])pstack(?![\w/-])", "mpstack", text)
    if is_skill_md:
        head = re.match(r"---\n.*?\n---\n", text, re.S)
        if head:
            text = FRONTMATTER_DROP.sub("", head.group(0)) + text[head.end():]
    return text


def copy_tree(src, dst, names, rename_name=None):
    for root, dirs, files in os.walk(src):
        for f in files:
            s = os.path.join(root, f)
            rel = os.path.relpath(s, src).replace("\\", "/")
            if any(p in (os.path.basename(src) + "/" + rel) for p in SKIP_PATHS):
                continue
            d = os.path.join(dst, rel)
            os.makedirs(os.path.dirname(d), exist_ok=True)
            if os.path.splitext(f)[1] in TEXT:
                try:
                    raw = open(s, encoding="utf-8", newline="").read()
                except UnicodeDecodeError:
                    shutil.copyfile(s, d)
                    continue
                is_skill = rel == "SKILL.md"
                out = port_text(raw.replace("\r\n", "\n"), names, f.endswith(".md") and is_skill, is_skill) if f.endswith(".md") else raw
                if is_skill and rename_name:
                    out = re.sub(r"^name:.*$", f"name: {rename_name}", out, count=1, flags=re.M)
                open(d, "w", encoding="utf-8", newline="\n").write(out)
            else:
                shutil.copyfile(s, d)


def main(pstack, matt, out):
    p_skills = sorted(d for d in os.listdir(os.path.join(pstack, "skills")) if d not in PSTACK_SKIP)
    names = {PSTACK_RENAME.get(n, n) for n in p_skills} | set(MATT_TAKE.values())
    for n in p_skills:
        new = PSTACK_RENAME.get(n, n)
        copy_tree(os.path.join(pstack, "skills", n), os.path.join(out, "skills", new), names, new if new != n else None)
    for src, new in MATT_TAKE.items():
        copy_tree(os.path.join(matt, "skills", src), os.path.join(out, "skills", new), names, new)
    for f in os.listdir(os.path.join(pstack, "agents")):
        raw = open(os.path.join(pstack, "agents", f), encoding="utf-8").read()
        os.makedirs(os.path.join(out, "agents"), exist_ok=True)
        text = port_text(raw, names, True, False)
        text = re.sub(r"^model:.*\n", "", text, flags=re.M)
        open(os.path.join(out, "agents", f), "w", encoding="utf-8", newline="\n").write(text)
    print(len(names), "skills:", " ".join(sorted(names)))


if __name__ == "__main__":
    main(*sys.argv[1:4])

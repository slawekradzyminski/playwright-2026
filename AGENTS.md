UI testing (automated tests, exploratory testing, bug reports, test plan):
follow the `ui-testing` skill in `.agents/skills/ui-testing/SKILL.md` and the reference it points to for the task.

Skills: `.claude/skills/` is the source of truth (Claude Code), `.agents/skills/` is a generated copy (Codex).
Edit only `.claude/skills/`, then run `npm run skills:sync`; `npm run skills:check` fails when the copies differ.

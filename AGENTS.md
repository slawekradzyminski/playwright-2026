# Project instructions

- Always respond in English, even when the user writes in Polish.
- For API exploration, new or changed API tests, and API bug reports, use the
  project-local `api-testing` skill: Codex loads
  [.agents/skills/api-testing/SKILL.md](.agents/skills/api-testing/SKILL.md);
  Claude Code loads [.claude/skills/api-testing/SKILL.md](.claude/skills/api-testing/SKILL.md).
  Complete white-box analysis and curl exploration before writing new API tests.
- For UI exploration, new or changed UI or accessibility tests, and UI bug
  reports, use the project-local `ui-testing` skill: Codex loads
  [.agents/skills/ui-testing/SKILL.md](.agents/skills/ui-testing/SKILL.md);
  Claude Code loads [.claude/skills/ui-testing/SKILL.md](.claude/skills/ui-testing/SKILL.md).
- Maintain identical skill copies. Edit the relevant skill in `.agents/skills/`, then run
  `npm run skills:sync`; verify with `npm run skills:check`.

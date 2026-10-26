# Project instructions

- Always respond in English, even when the user writes in Polish.
- For API exploration, new or changed API tests, and API bug reports, use the
  project-local `api-testing` skill: Codex loads
  [.agents/skills/api-testing/SKILL.md](.agents/skills/api-testing/SKILL.md);
  Claude Code loads [.claude/skills/api-testing/SKILL.md](.claude/skills/api-testing/SKILL.md).
  Complete white-box analysis and curl exploration before writing new API tests.
- Maintain identical skill copies. Edit `.agents/skills/api-testing/`, then run
  `npm run skills:sync`; verify with `npm run skills:check`.

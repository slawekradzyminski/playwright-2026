# Skill retro

This skill is kept useful by a short retro at the end of every session that used it: automated tests, an exploratory session or bug reporting. It takes a few minutes and ends with either "no changes" or a concrete edit.

## Questions

Answer each from what actually happened in this session, not in general:

1. **Missing** – what did I have to find out on my own that the skill should have told me? (a fixture, a selector rule, an app quirk, a command, a test-data trick)
2. **Wrong or outdated** – which instruction did not match the repo or the app? (paths, file names, fixture names, versions, texts)
3. **Unused or noise** – which parts did I read but not need, or which ones repeat each other or the code? Could they be removed or shortened?
4. **Friction** – where did I hesitate, go back, or break a rule because it was unclear? Which step would be clearer as a checklist or an example?
5. **Repeated feedback** – did the user correct me on something the skill could prevent next time?

## Deciding what to change

- Change the skill only for things that will matter again; a one-off detail of this screen belongs in the test plan or a bug report, not here.
- Prefer removing and tightening over adding. Every new line must earn its place; if something is added, look for something to cut.
- Put each fact in one place: rules in `SKILL.md`, how-to in the matching `references/` file, the bug format in `assets/bug-template.md`. Facts the code already says (fixture signatures, test ids) stay in the code.
- Keep `SKILL.md` short; detail goes to references.

## Applying changes

- **Fix directly**: wrong paths or names, outdated facts, typos, a missing command. Mention the fix in the final message.
- **Propose first**: new or changed rules, removed sections, a new reference file. Show the user the suggested change (a short diff or bullet list) and apply it only after they agree.
- Edit only `.claude/skills/ui-testing/`, then run `npm run skills:sync` and `npm run skills:check` so the Codex copy in `.agents/skills/` matches.
- End the session with one line: `Skill retro: <what changed>` or `Skill retro: no changes`.

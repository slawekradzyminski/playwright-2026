# Review and improve before finishing

Self-review is sufficient unless the user requests another reviewer. Inspect the final diff and new files.

1. **Correctness:** Does each scenario title match the action and an explored/agreed outcome? Would assertions detect a wrong destination, wrong message or missing business effect? Preserve meaningful checks during extraction.
2. **Readability:** Can the scenario be understood from given/when/then and named page/component methods? Keep expected values visible, the tested action explicit, and URL assertions separate. Extract distracting mechanics without hiding intent.
3. **Reliability:** Check selector stability, fixture isolation, cleanup on failure, live versus mocked behavior, and bounded asynchronous waits. Remove redundant preflight checks without removing assertions on actual outcomes.
4. **Scope:** Keep the requested screen and a small business-focused suite. Do not automate every exploratory observation or expand desktop automation to other viewports. Review visual evidence separately from DOM/test results.
5. **Improve:** Fix issues found in the changed scope and simplify repeated mechanics. Avoid unrelated refactors and new abstractions solely to reduce line count.
6. **Verify:** After code edits run `npm run test:ui` and `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`. Run `npm run test:api` when shared code/configuration changes or repository instructions require it. Report blockers separately from test failures; do not weaken assertions or skip defects to obtain a pass. For skill-only edits validate skill structure, reference links and copy parity; no browser exploration is needed merely to edit documentation.
7. **Close out:** Run `git diff --check`; inspect intended changes for secrets. Update affected coverage notes in `pages/README.md` and bug records, keeping them concise. Report actual commands/results, relevant evidence and limitations. Do not advance a verification date without executing the checks or create a session-history document.

Improve the skill from demonstrated problems, keeping shared rules in `AGENTS.md` and synchronizing the Claude copy.

# Review and improve before finishing

Review the final diff, including new files, after implementation. Self-review is sufficient unless the user requests a separate reviewer.

1. **Correctness:** Does each title match the exercised behavior? Is the expected result grounded in exploration or an agreed requirement? Would assertions fail for the relevant defect, wrong owner, missing side effect, or unwanted mutation?
2. **Isolation:** Check disposable data, prerequisite failures, teardown on failure, dependency order, and parallel execution. Check polling has a deadline and a useful failure message.
3. **Readability:** Read each test as a business scenario. Keep given/when/then obvious, the tested action visible, and methods as short as practical. Move difficult mechanics into focused clients, fixtures, validators or helpers. Keep meaningful inputs and outcomes visible; avoid abstraction solely to reduce line count.
4. **Improve:** Fix issues found in the changed scope, remove redundant setup and weak assertions, improve business-oriented names, and consolidate repeated complex logic. Do not refactor unrelated endpoints just to standardize style.
5. **Verify:** For code changes, run `npm run test:api` and `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` after the final edits. Investigate failures without weakening assertions or hiding defects with skips. Report environment blockers distinctly from failures; never call an unrun suite passing. For skill-only edits, validate skill structure, reference links and copy parity; run the API suite when repository instructions require it.
6. **Close out:** Run `git diff --check`, inspect intended changes and new files for secrets, update affected bug records and the compact plan when warranted. Report what changed, verification and any remaining blocker. Passing tests do not close bugs or prove release readiness.

Improve this skill when actual use reveals missing or misleading guidance. Make the smallest evidence-based correction in the relevant reference; keep shared rules in `AGENTS.md` and synchronize the Claude copy. Do not append session logs or speculative universal rules.

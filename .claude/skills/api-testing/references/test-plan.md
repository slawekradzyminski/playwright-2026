# Maintain the compact test plan

Keep `docs/api-test-plan.md` roughly one page (aim for at most 60 lines). Replace outdated facts instead of appending session histories.

Retain only the last verified date/build/command/result, a small coverage-by-area table, important gaps and prerequisites, links to findings, and ordered next priorities. Label historical execution evidence; do not advance its date without executing the checks.

Count coverage by HTTP method + path in the retained OpenAPI contract, with a dedicated active spec asserting that operation. Helper, fixture and cleanup calls do not count. Recount when operation coverage changes; endpoint breadth does not imply exhaustive scenario or schema coverage.

Keep detailed reproduction and dispositions in `docs/bugs/api/`, procedures in this skill, and scratch exploration in ignored `exploration/`. Preserve dated contract evidence. Do not copy the bug register, scenario catalog, implementation rules or agent-session history into the plan. Update other reports only when requested; clearly label an older report as historical.

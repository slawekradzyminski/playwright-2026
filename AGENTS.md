- use English
- use given (test setup), when (tested action) and then (assertion)
- separate the given, when and then sections with one blank line
- order api tests via response code ascending (200 -> 400 -> ...)
- parametrise tests when possible
- report bugs in reports/bugs if you see any
- before automating tests do exploratory tests first, make sure endpoints work as described in doc
- initialise endpoint API clients in `test.beforeEach`
- keep tests for each API endpoint in a separate spec file
- read ./docs/*

- for API test work, follow `.agents/skills/api-testing/SKILL.md` and its relevant references (mirrored in `.claude/skills/api-testing`)

- documentation-only bugs do not block tests of verified, intended API behavior; add a bug-reference comment above affected tests
- cover representative 400 and 401 responses for every endpoint in scope that returns them

- maintain `reports/api/test-plan.md` and `reports/api/coverage-map.json` after API test or contract changes; review target assertions (not fixture/cleanup calls), refresh reviewed spec hashes, run `npm run coverage:api` and `npm run coverage:api:check`, and record actual execution results separately from endpoint breadth

- reuse `validators/jsonResponse.ts` (`expectJson`, or `expectError` for message errors) for JSON response assertions; keep endpoint-specific body checks and register created resource IDs before assertions that could interrupt cleanup

## Agent execution

- Complete requested work through verification; resolve routine implementation choices from repository context. Ask only when missing information materially affects correctness or scope, and continue independent authorized work while waiting.
- Explicit user instructions take precedence over skill guidelines, subject to system and developer instructions. If a skill blocks requested work, link its exact `SKILL.md`, quote the applicable rule, and explain the blocker.
- Treat follow-up corrections as updates to the active task; preserve completed work that still applies.
- Use concise English: lead with the result, then relevant evidence, checks and unresolved gaps. Use lists or tables when they improve comparison; avoid stock phrases and unnecessary narration.
- Delegate only when the user or applicable instructions authorize it and a bounded subtask can run independently. Keep shared test resources and cleanup ownership isolated.
- Match verification to the change. API test or contract changes retain all required exploration, suite and coverage checks above. For instruction-only edits, check links, consistency and mirrored skills; do not run live API scenarios solely to validate prose. Repeat passed checks only after relevant changes, failures or unresolved concerns.
- See `docs/agent-workflow.md` for the source and application of this guidance.

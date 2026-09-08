- use English
- use given (test setup), when (tested action) and then (assertion)
- separate the given, when and then sections with one blank line
- order api tests via response code ascending (200 -> 400 -> ...)
- parametrise tests when possible
- report bugs in reports/bugs if you see any
- before automating tests do exploratory tests first, make sure endpoints work as described in doc
- initialise endpoint API clients in `test.beforeEach`
- keep tests for each API endpoint in a separate spec file
- document discovered bugs in reports/bugs
- read ./docs/*

- for API test work, follow `.agents/skills/api-testing/SKILL.md` and its relevant references (mirrored in `.claude/skills/api-testing`)

- documentation-only bugs do not block tests of verified, intended API behavior; add a bug-reference comment above affected tests
- cover representative 400 and 401 responses for every endpoint in scope that returns them

- maintain `reports/api/test-plan.md` and `reports/api/coverage-map.json` after API test or contract changes; review target assertions (not fixture/cleanup calls), refresh reviewed spec hashes, run `npm run coverage:api` and `npm run coverage:api:check`, and record actual execution results separately from endpoint breadth

- reuse `validators/jsonResponse.ts` (`expectJson`, or `expectError` for message errors) for JSON response assertions; keep endpoint-specific body checks and register created resource IDs before assertions that could interrupt cleanup

- use English
- use given (test setup), when (tested action), then (assertions)
- separate given, when, and then sections with a blank line in every test; keep each section comment directly above its code

# API test rules
- create http clients for each endpoint
- each endpoint should be tested in separate test file
- order tests by status code ascending (200 -> 400 -> ...)
- make sure tests keep passing - `npm run test:api`
- before automating given tests perform exploratory testing session, see .codex/skills/api-testing/SKILL.md
- initialize clients in beforeEach

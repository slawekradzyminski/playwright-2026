# playwright-2026 course project

Apply this profile only when working in the course repository. Paths below are relative to that repository, not this skill. Re-read the current files: this profile records discovery hints, not immutable API behavior.

- Read `AGENTS.md` and any applicable `CLAUDE.md`. Follow this skill and its supporting references for the API testing workflow.
- The project identifies `https://github.com/slawekradzyminski/test-secure-backend` as the backend. Inspect its relevant source/tests and establish the relationship to the deployed revision; the repository name alone proves neither.
- Target the configured `APP_BASE_URL` gateway, using README/test configuration for setup. Do not substitute internal service ports.
- The saved contract is `docs/openapi.json`; the documented live contract route is `/v3/api-docs`.
- Store assessment, scenario plan, sanitized evidence, coverage decisions, and results in `reports/exploration`. Use `reports/bugs/TEMPLATE.md` and `reports/bugs/README.md` for findings.

| Purpose | Fixture | Value / behavior to verify in current code |
| --- | --- | --- |
| Admin requests | `fixtures/loggedInAdmin.fixture.ts` | `adminToken`; extends customer fixture |
| Customer requests | `fixtures/loggedInUser.fixture.ts` | `loggedInUser.token`; disposable customer and cleanup |
| Product writes/cleanup | `fixtures/products.fixture.ts` | Both identities and `productIds`; extends admin fixture |
| Public endpoints | `@playwright/test` where authentication/cleanup fixtures are unnecessary | No token |

Keep specs for each HTTP method/path separate under `tests/api`. Initialize endpoint clients in `test.beforeEach`, use given/when/then separated by one blank line, parameterize equivalent cases, and order expected response codes ascending. Prefer existing `http/`, `generators/`, and `validators/` helpers.

Run an affected spec with `npx playwright test tests/api/<existing-spec>.spec.ts`, substituting the actual file, then run `npm run test:api`. Confirm current commands in `package.json` before execution.

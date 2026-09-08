# Automated API tests

Implement the justified API subset from the assessment, updated with exploration findings. Link each selected case to its risk and exploration evidence; retain lower-level gaps and omitted-case rationales in the report. Do not turn the whole exploratory matrix into automated API tests by default.

Use these conventions, respecting explicit project and user instructions:

- Write in English. Use `// given` for setup, `// when` for the tested action, and `// then` for assertions, with one blank line between sections. Keep an explicit given section even when setup comes entirely from fixtures.
- Keep each HTTP method/path in a separate spec file. Order tests by expected response code ascending (200, 201, 204, 400, 401, 403, 404, ...), including parameterized groups.
- Parameterize equivalent scenarios where possible, using descriptive case names.
- In Playwright, initialize the endpoint API client in `test.beforeEach`; use the equivalent per-test setup in another framework. Reuse existing clients, generators, and validators.
- Assert the relevant response contract and observable state, not just a status code. Tests must be independent and clean up their own data, including after failures.


## Role fixtures

Use the existing admin fixture for admin requests and the customer fixture for customer requests. Discover their actual interfaces before coding. Anonymous requests omit authentication; invalid-authentication requests deliberately supply an invalid credential. Importing a fixture does not prove that a role was exercised: inspect the token/identity supplied to the tested request.

Admin setup or cleanup may support a customer test, but must not replace the customer's identity in the tested action. Cover relevant allowed customer operations and denied privileged operations. Avoid multiplying every validation input by every role. Reuse resource-cleanup fixtures and track created IDs even when an unexpectedly successful response occurs in a negative case.

## Verification and handover

Run the affected specs, then the project's relevant API suite against the configured environment. Record commands, target, outcomes, and blockers. Investigate failures rather than weakening assertions. Map automated cases to exploration IDs and account for omitted or blocked scenarios.

Hand over source/deployed revision alignment, assessment evidence, lower-level gaps and proposed cases, exploration evidence, bug reports, selected API case count and rationale by endpoint/role, test results, and outstanding cleanup or requirement questions. Never describe unexecuted checks as passed.

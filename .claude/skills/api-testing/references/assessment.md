# Backend assessment and test-level selection

Record the target gateway, date, application version if available, and contract source/version. Compare the live contract with the saved contract where available; record discrepancies rather than silently choosing the one that matches the implementation. Use local project configuration to locate credentials without including their values in evidence.

Before designing scenarios, perform a focused assessment of the backend code and existing tests for the requested endpoint. Trace the controller/route, request DTO and validation, service/domain logic, authorization, persistence, and error mapping. Review relevant implementation risks such as missing validation activation, inconsistent rules, missing ownership checks, and transaction or error-handling gaps. Keep the assessment limited to the affected behavior and its dependencies.

Locate the relevant backend repository from project guidance or configuration and record its revision.

Establish whether it matches the deployed application using available build/version metadata. If the source, tests, or deployed revision cannot be verified, record the limitation explicitly: local code alone does not prove what runs in the environment. Continue with contract-based HTTP exploration and make coverage decisions provisional where evidence is missing.

Read the actual unit and component/integration tests, including their inputs and assertions. Identify which requirements, boundaries, branches, and failure paths they verify and which dependencies they mock. An existing test file, test name, or line-coverage percentage does not establish behavioral coverage. Run the relevant backend tests when the checkout and dependencies allow it; record the command, revision, result, and any inability to execute them. Distinguish inspected coverage from coverage verified by a test run. Do not claim the functionality is fully covered without mapping its relevant requirements and risks to evidence.

Create `reports/exploration/<date>-<endpoint>.md` and record this compact assessment before the scenario plan:

| Behavior / risk | Requirement source | Implementation evidence | Existing test evidence and run status | Gap / uncertainty | Preferred test level and next action | API case and rationale, if needed |
| --- | --- | --- | --- | --- | --- | --- |
| Input length boundaries | Contract field constraint | DTO/validator at recorded revision | Test file/cases and assertions, passed or inspected only | Missing upper-bound assertion | Add a unit test for the validator | Representative HTTP rejection verifies validation is wired into the route |

Choose the lowest test level that can credibly detect the failure:

| Behavior | Preferred coverage | Reason to retain an API test |
| --- | --- | --- |
| Individual field boundaries, null/empty variants, formats, pure business rules | Unit tests; component tests where framework validation must run | A representative valid/invalid request verifies deserialization, validation activation, and the public error response; additional cases need a distinct integration risk |
| Database constraints, queries, transactions, service-to-repository behavior | Backend integration tests with the relevant real dependency | Externally visible persistence or side effects across the complete request path |
| HTTP status/body/headers, routing, serialization, exception mapping | HTTP/component contract tests where sufficient | A deployed gateway or full request-path risk remains untested below the API suite |
| Authentication, role/ownership authorization | Unit/component tests for policy rules plus API checks for enforcement | Relevant allowed and denied identities must exercise the actual route and security configuration |
| Core user-visible workflow | Unit/integration coverage of its rules | A small number of representative end-to-end API flows confirms the pieces work together |

Missing unit coverage is a lower-level test gap, not an automatic reason to reproduce every input combination in Playwright. Record a concrete proposed case and target test file/component. Add backend tests if backend changes are in the requested scope; otherwise hand over the gap explicitly. Missing coverage by itself is not a confirmed product bug; suspicious implementation behavior still uses the [bug reporting workflow](bugs.md) immediately.

For each proposed automated API case, state the distinct failure it detects and why existing lower-level tests cannot adequately detect it. Keep representative happy paths, HTTP contract checks, relevant permission boundaries, and observable state changes. Avoid repeating all validator permutations or multiplying every input by every role. Parameterization reduces code duplication, not the number or cost of executed tests. There is no fixed case quota: add a case for a distinct material risk and omit duplicates with an evidence-based rationale. If lower-level coverage is unknown, do not treat it as present; record any temporary API coverage, why it is needed, and when it should be reviewed.

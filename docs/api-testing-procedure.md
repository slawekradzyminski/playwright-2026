# API testing procedure

This project serves testers. Every suspicious result deserves prompt investigation and a traceable report, including documentation defects. Treat all unexpected or buggy behaviour seriously and investigate it thoroughly.

Follow the phases below, in order, for every new or changed API endpoint. An endpoint is defined as a combination of an HTTP method and a path.

## 1. Assess the backend and choose test levels

Read [AGENTS.md](../AGENTS.md), the relevant API documentation ([saved OpenAPI](openapi.json)), existing [bug reports](../reports/bugs/README.md), endpoint clients, and fixtures. Confirm the target gateway from `APP_BASE_URL`; use the README setup instructions for credentials. Record the environment, date, application version if available, and contract source/version. Compare the live `/v3/api-docs` with the saved contract where available; record discrepancies rather than silently choosing whichever matches the implementation.

Before designing scenarios, perform a focused assessment of the backend code and existing tests for the requested endpoint. Trace the controller/route, request DTO and validation, service/domain logic, authorization, persistence, and error mapping. Review relevant implementation risks such as missing validation activation, inconsistent rules, missing ownership checks, and transaction or error-handling gaps. Keep the assessment limited to the affected behavior and its dependencies.

Backend repo: https://github.com/slawekradzyminski/test-secure-backend

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

Missing unit coverage is a lower-level test gap, not an automatic reason to reproduce every input combination in Playwright. Record a concrete proposed case and target test file/component. Add backend tests if backend changes are in the requested scope; otherwise hand over the gap explicitly. Missing coverage by itself is not a confirmed product bug; suspicious implementation behavior still follows phase 3 immediately.

For each proposed automated API case, state the distinct failure it detects and why existing lower-level tests cannot adequately detect it. Keep representative happy paths, HTTP contract checks, relevant permission boundaries, and observable state changes. Avoid repeating all validator permutations or multiplying every input by every role. Parameterization reduces code duplication, not the number or cost of executed tests. There is no fixed case quota: add a case for a distinct material risk and omit duplicates with an evidence-based rationale. If lower-level coverage is unknown, do not treat it as present; record any temporary API coverage, why it is needed, and when it should be reviewed.

## 2. Design and execute the exploration

### Design the scenario plan

Before sending test requests, add a scope and a scenario table to the assessment report:

| ID | Method/path | Role | Setup and input | Expected status, body and state | Expectation source | Actual result/evidence | Outcome / bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | Selected endpoint | Admin/customer/anonymous | Unique disposable data | Documented result | Contract section or requirement | Pending | Not run |

Use the assessment to select successful requests, representative validation failures, missing resources, authentication and authorization checks, and state changes where relevant. Explore additional boundary or missing/null/empty/invalid inputs when code review, missing coverage, or an observed result suggests a specific risk. Include relevant admin, customer, and anonymous access; distinguish invalid authentication from insufficient permissions. Exploratory probes may be broader than the eventual automated suite: a useful one-off probe does not automatically deserve a permanent API test.

Requirements and the API contract define expected behavior; backend code explains the implementation and helps locate risks. Do not use current code behavior as the sole oracle or copy its defects into assertions. Mark undocumented expectations as hypotheses requiring clarification. Do not invent requirements or claim every endpoint needs every scenario.

Plan how to create and remove disposable data. Use unique names and only modify resources created for this exploration; do not empty a shared catalog. Record dependencies and blocked scenarios.

### Execute exploratory tests from the terminal

Always execute the designed scenarios with `curl`, HTTPie, `wget`, or another terminal HTTP client **before writing or extending automated tests**. Reading the contract, inspecting existing tests, or running Playwright alone does not satisfy this phase.

For example, with `APP_BASE_URL` and an appropriate token already loaded into the shell:

```bash
curl --silent --show-error --include \
  "$APP_BASE_URL/api/v1/products" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

Adapt the method, payload, and identity to each scenario. Capture the request, response status, relevant headers, body (including an empty body), and follow-up reads proving persisted state or lack of side effects. Keep credentials, tokens, and personal data out of committed evidence; replace them with named placeholders. Save sanitized evidence alongside the exploration report and link each result to it.

Record pass, suspected defect, or blocked for each scenario. Investigate unexpected outcomes immediately under phase 3, then resume unaffected exploration. Clean up disposable resources and record the cleanup result, including failures.

Before automation, summarize which behaviors were verified against the contract, which remain uncertain or blocked, and which are excluded because of open bugs. Automate only explored, verified scenarios. If the environment is unavailable, report the blocker; do not substitute assumed results or begin automation for the blocked scope. Historical evidence informs the plan but does not replace exploration of the current change.

## 3. Report and triage defects immediately

As soon as something suspicious appears, create or update a report in `reports/bugs` and tell the person requesting the work; do not wait until automation or the end of the task. Start with status `Suspected` if evidence is incomplete. Check for duplicates, reproduce with a minimal request when feasible, and preserve the original observation. A failed attempt to reproduce is information, not a reason to discard a finding.

Use the [bug template and classification rules](../reports/bugs/README.md). Distinguish functional behavior from documentation/contract mismatches using the `Type` field. Keep stable `BUG-NNN` IDs and filenames so existing links survive. One report per independently actionable issue; link related issues.

State the expected behavior and its source separately from the actual result. If a requirement is ambiguous, record the observed behavior and the question to resolve. Do not downgrade an issue merely because it concerns documentation or an error message: describe its concrete impact and propose severity with a rationale. Do not claim a fix or a fresh reproduction without evidence.

Do not add automated tests that reproduce known open bugs, mark them as expected failures, skip them to disguise the gap, or assert incorrect behavior just to get a passing suite. Link the excluded scenarios to their reports. After a fix and exploratory verification, ordinary passing regression coverage can be added.

## 4. Implement automated API tests

Implement the justified API subset from the assessment, updated with exploration findings. Link each selected case to its risk and exploration evidence; retain lower-level gaps and omitted-case rationales in the report. Do not turn the whole exploratory matrix into automated API tests by default.

Apply every rule in [AGENTS.md](../AGENTS.md):

- Write in English. Use `// given` for setup, `// when` for the tested action, and `// then` for assertions, with one blank line between sections. Keep an explicit given section even when setup comes entirely from fixtures.
- Keep each HTTP method/path in a separate spec file. Order tests by expected response code ascending (200, 201, 204, 400, 401, 403, 404, ...), including parameterized groups.
- Parameterize equivalent scenarios where possible, using descriptive case names.
- Initialize the endpoint API client in `test.beforeEach`. Reuse existing clients, generators, and validators.
- Assert the relevant response contract and observable state, not just a status code. Tests must be independent and clean up their own data, including after failures.

Select the identity for the **tested request** explicitly:

| Scenario | Fixture/import | Identity for the tested request |
| --- | --- | --- |
| Admin operation | `fixtures/loggedInAdmin.fixture.ts` | `adminToken` |
| Customer operation | `fixtures/loggedInUser.fixture.ts` | `loggedInUser.token` |
| Product writes with cleanup | `fixtures/products.fixture.ts` | Admin or customer token as the scenario requires; register created IDs in `productIds` |
| Anonymous/invalid authentication | Appropriate base or cleanup fixture | No token or an intentionally invalid token |

The admin fixture extends the customer fixture, and the products fixture extends the admin fixture, so product specs can request either identity. Fixtures are lazy: importing one does not mean every test exercises that role. Use admin credentials for setup/cleanup when needed, but keep them out of the tested customer request. Cover allowed customer behavior and denied customer operations wherever the explored contract requires them; do not run all tests as admin. Use `@playwright/test` directly for public endpoints when authenticated fixtures are unnecessary.

Example structure using existing project APIs:

```ts
import { test, expect } from '../../fixtures/loggedInUser.fixture';
import { ProductClient } from '../../http/productClient';

let client: ProductClient;
test.beforeEach(({ request }) => {
  client = new ProductClient(request);
});

test('200 - customer can read products', async ({ loggedInUser }) => {
  // given
  const token = loggedInUser.token;

  // when
  const response = await client.getAllProducts(token);

  // then
  expect(response.status()).toBe(200);
  expect(Array.isArray(await response.json())).toBe(true);
});
```

## 5. Verify and hand over

Run the affected specs first, then the API suite (`npm run test:api`) against the configured environment. Record commands, target, outcomes, and any blockers. Investigate failures rather than weakening assertions. Link automated cases back to exploration scenario IDs in the exploration report and account for all omitted or blocked scenarios.

The handover must identify the backend/deployed revision relationship, assessment evidence, lower-level coverage and proposed gaps, exploration evidence, new or updated bug reports, the selected API case count and rationale by endpoint and role, test results, and outstanding cleanup or requirement questions. Never describe unexecuted checks as passed.

## 6. Self-improvement loop

After each run perform a retrospective on how well this procedure worked and feel free to update it with latest findings/steps/rules/etc.
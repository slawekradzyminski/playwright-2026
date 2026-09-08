# Exploratory HTTP testing

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

Adapt the method, payload, and identity to each scenario. Capture the request, response status, relevant headers, body (including an empty body), and follow-up reads proving persisted state or lack of side effects. Keep credentials, tokens, and personal data out of committed evidence; replace them with named placeholders. Save sanitized evidence alongside the exploration report and link each result to it.

Record pass, suspected defect, or blocked for each scenario. Investigate unexpected outcomes immediately using [bug reporting](bugs.md), then resume unaffected exploration. Clean up disposable resources and record the cleanup result, including failures.

Before automation, summarize which behaviors were verified against the contract, which remain uncertain or blocked, which are excluded because of functional bugs, and which remain eligible despite documentation-only mismatches. Automate only explored, verified scenarios. If the environment is unavailable, report the blocker; do not substitute assumed results or begin automation for the blocked scope. Historical evidence informs the plan but does not replace exploration of the current change.

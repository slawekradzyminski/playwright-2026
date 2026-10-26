# White-box exploration and runtime checks

## 1. Read before sending requests

Read the implementation of the endpoints in scope before any API request,
including the OpenAPI fetch. Trace controllers, DTO validation, services,
entities, repositories, exception handlers, security configuration, and profile
configuration. Follow related-resource paths when they affect the endpoint.

Build a small working matrix: input or rule, expected behavior and its basis,
code location, suspected failure, runtime probe, observed result. Inspect:

- Missing/inconsistent validation and JSON coercion; DTO limits versus database
  columns and downstream libraries, including BCrypt's 72-byte boundary.
- Case/whitespace normalization, uniqueness checks, lookup behavior, and the
  consistency of create, update, and authentication paths.
- Unmapped exceptions, error schemas, authorization order and ownership checks.
- Stale snapshots, duplicated state, transactions, and side effects on related
  resources such as stock, cart totals, orders, and deletion references.
- Profile and configuration switches that change or disable protections.

Derive expected behavior from the contract, established rules and invariants;
code explains observed behavior but does not by itself prove it is correct.

## 2. Identify the environment

Record the gateway, date, reference commit, running backend build/revision,
active profile, and relevant feature switches. Use available build metadata,
container image labels, startup logs, or deployment configuration. Inspect only
relevant non-secret values; avoid dumping container environments or `.env`.

An image tag alone does not prove the source commit. If the runtime differs,
inspect the matching source revision in the scratchpad when available. If the
revision/profile cannot be established, state that uncertainty explicitly and
keep code-based explanations provisional.

Fetch the live OpenAPI document with curl and inspect the operations, parameters,
request/response schemas, security requirements, and documented status codes.
Save only relevant sanitized evidence in the scratchpad.

## 3. Probe with curl

Use fresh generated test data, track created IDs/usernames, and arrange cleanup
before mutating state. Capture HTTP status, relevant headers, body, and pre/post
state. Use bounded requests (for example `curl --max-time 20 --silent --show-error
--include ...`); avoid `--fail` when inspecting error bodies. Use JSON files or
proper shell quoting so payloads are not changed by shell expansion.

Turn every code-level suspicion into a runtime check. If a check is blocked or
outside the authorized environment/scope, record it as unverified with the reason.
Probe every field and parameter deeply, using applicable partitions:

| Surface | Probes |
| --- | --- |
| Presence and type | Missing, null, empty, whitespace-only, wrong scalar/container type, coercible values |
| Text | Length boundaries, case, surrounding whitespace, control characters, Unicode and byte lengths |
| Numbers | Negative, zero, fractional, minimum/maximum and adjacent values, overflow |
| Request shape | Malformed JSON, invalid path parameters, invalid query values, required headers/content type |
| Authentication | No token, malformed/invalid token, valid role, insufficient role, another user's data |
| Business/state | Duplicate/not-found/conflict cases, repeated mutations, persistence, related-resource side effects |

Use a valid baseline and vary one condition at a time, then test meaningful
interactions such as invalid input combined with insufficient authorization.
Check error bodies against the documented schema, not just the status code.
Verify rejected writes leave no unintended state; verify successful changes via
a subsequent read and relevant related resources.

Confront every surprising response with the implementation: trace the exact
branch, validator, exception handler, or security filter producing it. Separate
observed facts from explanations that remain suspected.

## 4. Triage and clean up

Read [reporting](reporting.md) for each discovered defect or policy question.
Check existing reports before creating another. Preserve the matrix's confirmed
results and unverified gaps so automation can select representative scenarios.

Clean up only resources created for this task, including unexpectedly successful
negative requests. Respect dependency order (for example remove a user's cart/
order references before deleting its products). Check cleanup responses; report
any remaining owned resources and cleanup failures. Do not reset shared data,
change protection settings, or patch the read-only backend to make checks pass.

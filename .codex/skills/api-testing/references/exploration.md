# Exploratory API testing

Exploration means following questions and investigating unexpected behavior, rather than only executing a fixed checklist. Use the workflow below to produce reproducible findings and decide what to automate.

## Start here

- [API bug register — individual findings and status](../../../../docs/bugs/README.md)

- [Copyable bug-report template](bug-report-template.md)
- [Swagger UI](http://localhost:8081/swagger-ui/index.html)
- [Live OpenAPI JSON](http://localhost:8081/v3/api-docs)
- [Saved OpenAPI snapshot — 2026-09-10](../../../../docs/exploratory-testing/openapi-2026-09-10.json)
- [Backend repository](https://github.com/slawekradzyminski/test-secure-backend)

The localhost links require the local stack to be running on your machine. The saved JSON is readable without the stack. It contains the full API; consult the bug register and test plan for the scope actually explored.

## Prepare a session

1. Define a question and scope, for example: “Can a client log in reliably, are invalid requests handled correctly, and does Swagger describe the responses?” Set a timebox and record untested areas when it ends.
2. Record the date, gateway URL, deployed image/version, configuration relevant to the test, source revision if available, and test account role/MFA state. A local checkout may differ from the running backend.
3. Read the operation, linked request/response schemas, and security requirements in Swagger. Record ambiguities before testing. Use agreed requirements as the oracle; code explains behavior but does not automatically make it correct.
4. Use local demo accounts or disposable fixtures. Know the side effects: a successful login creates a session/refresh token; enabling MFA or logging out can affect later tests. Plan cleanup that does not invalidate someone else's sessions.
5. Capture the current specification. Keep the snapshot referenced by existing bug reports intact; add a dated snapshot for a later session. OpenAPI is generated and can change with a deployment, even when the API appears stable.

From the repository root, an example for a **new date** is:

```sh
curl --fail --silent --show-error --max-time 15 \
  http://localhost:8081/v3/api-docs -o /tmp/exploration-openapi.json
python3 -m json.tool /tmp/exploration-openapi.json > docs/exploratory-testing/openapi-YYYY-MM-DD.json
```

Replace `YYYY-MM-DD` with the session date and review the JSON before committing. The September 10 snapshot was retained from the original exploration, so it matches the recorded findings. A schema snapshot is evidence of what was documented, not proof that the implementation conforms to it.

## Explore with curl

Start with one successful request, then change one factor at a time. Inspect status, response headers, body, and any observable side effect. `-i` includes headers; `--max-time` prevents an indefinite wait. Avoid `--fail` when exploring negative responses, since their error bodies are useful evidence.

Local demo example:

```sh
curl --silent --show-error --max-time 15 -i \
  http://localhost:8081/api/v1/users/signin \
  -H 'Content-Type: application/json' \
  --data-binary '{"username":"client","password":"client"}'
```

Then try an incomplete request:

```sh
curl --silent --show-error --max-time 15 -i \
  http://localhost:8081/api/v1/users/signin \
  -H 'Content-Type: application/json' --data-binary '{}'
```

Keep notes with: scenario, input, expected result and its basis, actual status/body, reproducibility, and follow-up question. Repeat suspicious results with the smallest request that still reproduces them. Check whether a stale token, rate limit, changed fixture, or different build explains the result. Do not infer a general security guarantee from one rejected attack-like input.

## Check functional behavior

| Area | Questions to explore |
|---|---|
| Happy path | Correct identity and role? Expected tokens? Can the token access an appropriate protected resource? |
| Presence | Missing property versus null versus empty string versus whitespace: are distinctions intentional and useful? |
| Boundaries | Minimum−1, minimum, maximum, maximum+1; test both fields independently. Add Unicode boundaries when relevant. |
| Types and parsing | Strings, numbers, booleans, objects, arrays, malformed JSON, duplicate keys, unknown properties, missing body. Are coercion rules intentional? |
| Credentials | Wrong password and unknown account; case sensitivity and whitespace; no accidental normalization of passwords. |
| HTTP behavior | Content-Type, Accept, supported methods, meaningful status codes, stable error format. Check overlapping routes before assuming 405. |
| Authorization | No role elevation through payload fields; invalid/tampered tokens rejected; public login behavior with stale Authorization headers understood. |
| Authentication states | MFA enabled/disabled, disabled or locked account, expiry. Use controlled fixtures and label branches you could not test. |
| Abuse and concurrency | Test a bounded sequence against the configured rate policy, including 429 and retry information; isolate shared IP quotas. Explore concurrent sessions only with a defined question. |
| Data exposure | No passwords, hashes, secrets, stack traces, or issued credentials in errors or committed evidence. Check cache headers on token responses. |

For unexpected status codes, document why the proposed status fits the failure. Do not classify a documented 422 for incorrect credentials as a defect just because another API uses 401. Missing validation can be a functional defect even if Swagger also needs clarification; explain the proposed requirement instead of inventing an existing one.

## Check Swagger against reality

For each observed response, compare the operation **and all referenced schemas**:

- Are path, method, request media types, and security requirements accurate?
- Are required properties declared? Are types, length limits, formats, enums, and examples correct?
- Does a present null value conform to the schema? Optional means a property may be omitted; it does not automatically allow null. In OpenAPI 3.1, allow null in the property's type/schema where appropriate.
- Is every supported response branch described, including errors, MFA challenges, and rate limiting where enabled?
- Does each status have the right body schema and media type? An error map should not be described as a token response.
- Are descriptions specific enough to explain conditional behavior, defaults, and token/header handling?
- Do examples satisfy validation and represent the intended environment? Do not publish real credentials or tokens as examples.
- Does a successful schema-validation result hide an overly permissive model (no required fields, unconstrained additional properties)? Read the semantics too.

A documentation bug should identify the exact operation/schema/property, show the actual response, quote or summarize the conflicting declaration, and propose a concrete correction. If the implementation violates an agreed contract, file a functional bug rather than changing Swagger to bless the defect. When both need correction, link the findings and avoid double-counting impact.

Use [bug reporting](bug-reporting.md) to classify and record findings, then [automation](automation.md) to select regressions.

## What belongs in Git

Keep findings in the central bug register and individual bug reports. Do not create separate exploration reports for each endpoint; put reproduction evidence directly in the relevant bug report.

**Keep tracked:** the skill and its references, bug register and individual findings, compact test plan, and dated OpenAPI snapshots.

**Keep local:** root `exploration/`, including temporary Python curl drivers, raw responses, and scratch notes. It is ignored by `.gitignore`; these files are not part of the test framework and are not needed to read the report. They remain on the original workstation for reference and can be deleted later if no longer needed. Do not force-add the folder.

Before committing, inspect `git status --short` and `git diff --check`. Review new documentation and JSON for private data as well as tracked diffs. Stage only the intended documentation changes; do not include unrelated local configuration. This documentation update does not change tracking of an existing `.env` file.

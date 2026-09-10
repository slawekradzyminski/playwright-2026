# Bug report template

Copy the section below into an issue or a Markdown report. Replace placeholders and remove hints that do not apply. Use one independently fixable problem per report. See the [severity/category guide](README.md#classify-findings).

---

# [M][FA] METHOD /path — short description of the observable problem

**ID:** <stable ID, or issue number after filing>
**Status:** Open / Needs clarification / Fixed, awaiting retest / Verified
**Severity:** H / M / L — <one sentence explaining user/test/integration impact>
**Category:** FA (functional API) / D (documentation)
**Observed on:** YYYY-MM-DD

## Environment and preconditions

- Base URL and deployed backend version/image: <values>
- Relevant configuration: <e.g. rate limiting enabled, MFA disabled>
- Account/role and starting state: <use fixture names; no private credentials>
- Swagger snapshot: <relative link or attachment and capture date>
- Source revision, if inspected: <revision; say if deployed revision is unknown>

## Steps to reproduce

1. <Set up the required state.>
2. <Send the request below.>
3. <Inspect the status/body or other observable result.>

```sh
curl --silent --show-error --max-time 15 -i \
  'http://localhost:8081/<path>' \
  -H 'Content-Type: application/json' \
  --data-binary '<minimal JSON payload>'
```

Use `-X` for methods other than the POST implied by `--data-binary`. Explain any placeholders so another tester can reproduce without access to your workstation.

## Actual result

- HTTP status: <status>
- Relevant headers: <only those needed>
- Sanitized body or observable side effect:

```json
{"replace": "with the observed response; redact issued tokens and personal data"}
```

- Reproducibility: <e.g. 2/2 attempts on the same build; do not invent a count>

## Expected result and basis

<Exact expected status, fields, or behavior. Link the agreed requirement or contract. If proposing a requirement because the contract is ambiguous, say so and identify the decision needed.>

## Documentation mismatch — complete for [D]

- Operation/schema/property: <exact location in the OpenAPI JSON>
- Currently documented: <declaration or short excerpt>
- Observed behavior: <link to evidence above>
- Proposed correction: <specific schema/description/example change>

## Impact

<Who is affected and what fails? Explain the severity. Separate demonstrated impact from possible consequences.>

## Evidence and investigation notes

<Sanitized captures, timestamps, related finding IDs, and relevant code references. Mark suspected causes as hypotheses. Never attach access/refresh tokens, private passwords, full Authorization headers, or unrelated personal data.>

## Acceptance criteria and retest

- [ ] <Original reproduction produces the agreed expected result.>
- [ ] <Relevant positive/negative neighboring case still works.>
- [ ] <Swagger matches the corrected behavior, if applicable.>
- [ ] <Regression case is linked or the reason for manual verification is recorded.>

**Retested on/build:** <fill after retest>
**Retest evidence:** <result and link>

## Side effects / cleanup

<Fixtures or sessions created; cleanup performed or still needed. Use “None” only if verified.>

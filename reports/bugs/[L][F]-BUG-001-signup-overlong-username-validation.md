# BUG-001: Signup reports the wrong validation message for an overlong username

## Severity rationale

Signup rejects the overlong username with 400, but describes the minimum instead of maximum length. The defect misdirects correction of one invalid input; account creation and the length boundary remain protected. No persistent mutation or blocked valid signup is recorded.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional
- Category: functional
- Tags: functional, api
- Status: Open
- Severity (proposed): Low

## Endpoint

`POST /api/v1/users/signup`

## Environment

- Observed on: 2026-09-07
- Base URL: `http://localhost:8081`
- Application version: Not recorded
- Contract source: `GET /v3/api-docs`; see [saved OpenAPI](../../docs/openapi.json)
- Identity: Anonymous

## Preconditions

Use an otherwise valid signup payload with a unique email.

## Reproduction

1. Send `POST /api/v1/users/signup` with `Content-Type: application/json` and the payload below. Replace the username placeholder with exactly 256 `a` characters.

```json
{"username":"<256 a characters>","email":"overlong-<unique>@example.test","password":"SignupPass123!","firstName":"Test","lastName":"Signup"}
```

## Expected

HTTP `400` with a username error explaining the maximum of 255 characters. The recorded contract defines `minLength: 4` and `maxLength: 255`. Suggested wording: `Username must be at most 255 characters`; this exact text is a proposal, not a documented contract guarantee.

## Actual

HTTP `400`:

```json
{"username":"Minimum username length: 4 characters"}
```

The request is rejected, but the message describes the wrong boundary.

## Evidence

The original report records this response; no separate raw transcript or repetition count was retained. This restructuring did not rerun the request.

## Impact

Users may shorten an already overlong username incorrectly or be unable to understand the validation failure. No acceptance bypass was observed.

## Cleanup

Not recorded in the original report. The recorded signup request was rejected.

## Follow-up and automation

Correct the maximum-length message. The previous report incorrectly claimed an expected-failure test existed; the current signup spec does not contain this scenario.

This report preserves historical observations; it was not freshly reproduced during the documentation update. Do not add automated coverage reproducing this open finding or mark it as an expected failure. After a fix, explore the corrected behavior before adding passing regression coverage.

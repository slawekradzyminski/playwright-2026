# BUG-0012: Oversized QR payload causes an unhandled server error

| Jira field / metadata | Value |
| --- | --- |
| Summary | [QR] Text exceeding QR capacity returns 500 instead of a client error |
| Issue Type | Bug |
| Priority | Medium (proposed) |
| Component/s | API / QR |
| Labels | api, qr, validation |
| Environment | http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | Image label `fd4c015434dd573f26bf8ff6691ff14611e2f247` |
| Verification date | 2026-10-27 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

Text beyond QR encoding capacity reaches the encoder and returns an internal server error. Clients receive no actionable validation message.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Authenticated `POST /api/v1/qr/create`, JSON `text` consisting of 4,000 lowercase `a` characters | Clear `400` validation error for input that cannot be encoded | `500 {"message":"Internal server error"}` |

## Root cause

The [DTO](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/qr/CreateQrDto.java#L14-L17) checks only for blank text. The [service](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/service/QrService.java#L15-L18) passes text to ZXing without mapping its capacity failure. The exact exception was not observed in server logs, so the failure path is a source-supported explanation rather than a confirmed stack trace. The contract omission is tracked in [BUG-0008](../documentation/BUG-0008-openapi-contract-mismatches.md).

## Steps to reproduce

Authenticate and send JSON with 4,000 lowercase `a` characters in `text` to `/api/v1/qr/create`.

## Evidence

One attempt on 2026-10-27 returned the response shown above. A short ASCII URL succeeded. No test data was persisted. Exact boundaries vary with QR encoding mode and character encoding and were not established.

## Suggested fix

Detect capacity failures and return an actionable documented `400`; do not rely on character count alone when capacity depends on encoded bytes and mode.

## Acceptance criteria

- Payloads that cannot be encoded receive a documented `400` error and do not produce a `500`.
- Encodable text still produces a decodable PNG.
- The fix includes an automated regression test covering both cases.

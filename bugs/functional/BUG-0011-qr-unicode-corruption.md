# BUG-0011: QR generation silently replaces characters outside the default encoding

| Jira field / metadata | Value |
| --- | --- |
| Summary | [QR] Generated QR codes corrupt Unicode text |
| Issue Type | Bug |
| Priority | High (proposed) |
| Component/s | API / QR |
| Labels | api, qr, encoding |
| Environment | http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | Image label `fd4c015434dd573f26bf8ff6691ff14611e2f247` |
| Verification date | 2026-10-27 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

The endpoint reports success while encoding a different value. Users scanning the QR code receive corrupted text, which can invalidate links or other data.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | `POST /api/v1/qr/create` with `{"text":"Zażółć gęślą 🐈"}` | A PNG that decodes to the supplied string | `200 image/png`; decoded text is `Za?ó?? g??l? ?` |

## Root cause

The image's revision contains [QrService](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/service/QrService.java#L16-L18), which calls ZXing without a character-set hint. Its default byte encoding cannot represent all Unicode characters. This is consistent with the observed substitutions; the image label is the source revision evidence.

## Steps to reproduce

1. Authenticate and send the request in the symptom table as JSON with a Bearer token.
2. Decode the returned PNG and compare it with the input.

## Evidence

One attempt returned a 400×400 PNG on 2026-10-27; ZXing's reader decoded the value shown above. An ASCII URL decoded correctly in the same session. No test data was persisted.

## Suggested fix

Set a UTF-8 character-set hint when encoding, and verify interoperability with QR readers.

## Acceptance criteria

- Polish characters, emoji, and ASCII round-trip without alteration.
- The fix includes an automated regression test that decodes the generated image and compares the exact text.

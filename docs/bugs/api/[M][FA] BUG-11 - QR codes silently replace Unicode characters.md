# [FA] POST /api/v1/qr/create — QR payload silently loses Unicode characters

**ID:** BUG-11
**Status:** Open

## Environment and reproduction

Observed and independently reproduced on 2026-09-10 at `http://localhost:8081`, backend image `slawekradzyminski/backend:3.7.16`. The live specification matches the retained [snapshot](../../exploratory-testing/openapi-2026-09-10.json). Authenticated local users can call the endpoint. The deployed source revision is unverified.

1. POST JSON `{"text":"Training QR: żółć 🌍\nSecond line"}` to `/api/v1/qr/create` with a valid Bearer token and `Content-Type: application/json`.
2. Save the returned PNG and decode the QR payload with a barcode reader. Two independent generations were decoded with macOS Vision `VNDetectBarcodesRequest`.
3. Repeat with ASCII `ASCII training QR\nSecond line` as a control.

| Input | Actual decoded payload | HTTP / image |
|---|---|---|
| `Training QR: żółć 🌍` followed by newline and `Second line` | `Training QR: ?ó?? ?` followed by newline and `Second line` | 200; valid 400×400 PNG |
| `ASCII training QR` followed by newline and `Second line` | Exact original text, including newline | 200; valid 400×400 PNG |

Both the supervisor and QR agent reproduced the Unicode loss. The image signature, IHDR and IEND are valid; image validity does not establish payload fidelity. No account/profile change is required. Disposable exploratory accounts were cleaned up; QR image files contain only synthetic training text.

## Expected behavior and basis

The operation promises a QR code for the supplied text and accepts a string without an ASCII-only restriction. Decoding a successful result must recover the original supported text. Silent replacement of characters violates that promise. If a character set is intentionally unsupported, explicitly document and reject it instead of silently changing the payload.

The inspected local `QrService.generateQrCode` calls `QRCodeWriter.encode` without a character-set hint. This corroborates a likely charset default problem; it does not establish the exact deployed source. An implementation fix should select a Unicode-safe encoding and verify reader compatibility.

## Impact assessment

Callers using Polish characters or emoji receive a successful image that conveys different information when scanned. Links or identifiers containing affected characters can become unusable; only the synthetic text corruption above was directly demonstrated. ASCII works as a limited workaround. No security exploit or production outage was demonstrated.

## Severity rationale and decision

Successful QR images decode to altered Polish characters and emoji, silently changing the requested artifact. ASCII input avoids the problem only by restricting user content. This is demonstrated data corruption in the feature output; production outage, broken real identifiers and security effects were not demonstrated.

**Severity:** M

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Retest / proposed regression

After a fix, generate and decode ASCII, Polish text, emoji and multiline payloads and assert exact equality. Include a decoder-based service test and an API regression if a portable decoder is available. The active API suite covers supported ASCII generation and response structure; it deliberately does not treat Unicode corruption as correct behavior. The temporary native Vision check is exploratory evidence, not a macOS dependency of the test suite.

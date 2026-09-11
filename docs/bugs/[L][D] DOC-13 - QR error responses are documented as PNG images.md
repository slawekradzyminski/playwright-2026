# [D] POST /api/v1/qr/create — errors are advertised as PNG images

**ID:** DOC-13
**Status:** Open

## Environment and evidence

Reproduced on 2026-09-10 at `http://localhost:8081`, backend `slawekradzyminski/backend:3.7.16`. The live specification matches the retained [snapshot](../exploratory-testing/openapi-2026-09-10.json); deployed source revision is unverified.

Authenticated POST with `{"text":"   "}` returns 400, a JSON content type and `{"text":"Text is required"}`. A request without a token returns 401 and JSON `{"message":"Unauthorized"}`. The operation declares both 400 and 401 as `image/png` with a string/byte schema, copied from the success response. Valid ASCII text returns a PNG as expected.

## Impact assessment

A consumer following the documented error media type may attempt image decoding instead of reading useful validation/authentication feedback. The request is correctly rejected, and inspecting the actual content type is a workaround. No material consumer failure or authentication bypass was demonstrated.

**Severity:** Low.

## Correction and retest

Keep image/png for 200; document JSON field-validation and message-error bodies for 400/401. Verify status, media type and schema for success and both errors. This is separate from [BUG-11](%5BM%5D%5BFA%5D%20BUG-11%20-%20QR%20codes%20silently%20replace%20Unicode%20characters.md), which concerns corrupted content in successful images.

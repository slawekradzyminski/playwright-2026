# BUG-qr-2 [FUNCTIONAL] Text over 2953 characters gives a 500 and a generic error with no hint about the limit

<!-- Working number; the final BUG-NNN and file name are assigned at merge. Suggested slug: functional-qr-long-text-500 -->

| | |
|---|---|
| Category | Functional |
| Severity / Priority | Minor / P3 |
| Environment | Chromium (Playwright 1.63), 1920×1080, 820×1180, 393×852; frontend 3.9.1, backend 3.9.4 |
| Preconditions | Logged-in client |

**Steps to reproduce**
1. Open `/qr`.
2. Paste 2954 characters (e.g. `a` × 2954) into "Text or URL for QR Code".
3. Click "Generate QR Code".

**Expected:** The limit is known before submitting (`maxlength` or a character counter) or the API answers 400 with a validation message such as "Text is too long for a QR code (max 2953 characters)", shown in the UI.

**Actual:** `POST /api/v1/qr/create` → **500** `{"message": "Internal server error"}`; the toast says only "Error – Failed to generate QR code". The textarea has no `maxlength` and no counter. 2953 characters still work (200).

**Evidence:**

| Text length | Response |
|---|---|
| 2953 | 200 `image/png` |
| 2954 | 500 `{"message":"Internal server error"}` |
| 3000, 5000 | 500 |

The 400 response for empty text (`{"text":"Text is required"}`) shows the validation path exists but does not cover the length. The limit is in bytes, so with multi-byte characters it will be lower once BUG-qr-1 is fixed.

**Notes:** Suspected cause: the encoder's "data too big" exception is not mapped to a 400 validation error. Covered by `qr.ui.spec.ts` ("should show an error for text longer than the QR capacity"), which checks today's generic message.

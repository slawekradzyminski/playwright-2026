# [D] Product endpoints — error response models do not match runtime bodies

Status: Open. Observed twice on 2026-09-10 at http://localhost:8081, before automation. Deployed image/source revision was not identified. Live contract captured locally in ignored `exploration/products-openapi.json`; the existing dated snapshot remains unchanged.

## Evidence and reproduction

Use a disposable product created by the configured administrator and a newly registered ROLE_CLIENT without MFA. Never use an existing catalog item for destructive checks.

- GET list and GET by ID without credentials return 401 `{"message":"Unauthorized"}`. Their 401 schemas declare an array of ProductDto and ProductDto respectively.
- POST and PUT with valid client credentials return 403 `{"message":"Access denied"}`; their schemas declare ProductDto. Missing credentials return a message object under the same incorrect success model.
- POST a complete valid payload with `price: 0`, or PUT `{ "price": 0 }` as admin: 400 `{"price":"Price must be greater than 0"}`. Both 400 schemas declare ProductDto rather than a validation map.
- GET or PUT `/api/v1/products/abc` as admin: 400 `{"error":"For input string: \"abc\""}` rather than ProductDto.
- DELETE a disposable product as admin (204), then repeat: 404 with an empty body, while Swagger declares ErrorDto. GET of the deleted ID correctly returns 404 `{"message":"Product not found"}`.

## Impact assessment

Consumers receive misleading error models and cannot derive correct error parsing from Swagger. Actual authentication, authorization and tested validation still reject requests correctly; no consumer outage or privilege bypass was demonstrated. Raw examples provide a practical workaround.

## Severity rationale and decision

Product error models misdescribe rejected requests and the empty deletion response. Tested authorization and validation still reject correctly, and callers can inspect status/content and map errors manually. The evidence establishes integration friction without a consumer outage or privilege bypass.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Expected correction and retest

Declare message errors and field validation maps on their actual branches. Describe DELETE's empty 404 response, or agree to return ErrorDto consistently. Repeat the requests and compare each status, body and media type with the updated contract. Keep runtime rejection tests active; do not use ProductDto to validate errors.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

An unauthenticated product GET returned the documented observed 401 message error while the unchanged specification still advertises a product model. Existing representative product mutation/error tests also pass. This reassessment did not rerun every original parsing boundary.

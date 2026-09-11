# [D] POST /api/v1/products — description schema permits a rejected empty string

Status: Open. Reproduced twice during follow-up exploration on 2026-09-10 at http://localhost:8081. Deployed revision unknown; live contract retained locally in ignored `exploration/products-openapi.json`.

## Evidence and reproduction

Authenticate as the configured admin. Submit a unique product name, description `""`, price 12.34, stockQuantity 2, category `Testing` and imageUrl `https://example.com/product.png`.

Actual: 400 `{"description":"Product description is required"}`. ProductCreateDto requires the description property but declares minLength 0 and maxLength 1000, so the supplied string satisfies the published constraints. A nonempty description succeeds. PUT of an existing disposable product with `{"description":""}` succeeds with 200 and persists the empty string; the update schema also declares minLength 0.

## Impact assessment

Swagger-derived clients lack the constraint needed to prevent a rejected creation. The server gives clear corrective guidance and a nonempty description works. No blocked core workflow or downstream outage was demonstrated.

## Severity rationale and decision

The creation contract permits an empty description that runtime validation rejects with clear corrective feedback. A nonempty description permits creation, so the demonstrated consequence is an omitted client-validation constraint. The creation/update policy difference still needs documentation; no wider workflow blockage was shown.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Expected correction and retest

Clarify the intended creation/update difference. If nonempty descriptions are required on creation, document that with minLength 1 and any intended whitespace restriction. If empty descriptions are intended, correct runtime validation instead. Retest empty/nonempty POST and PUT against the agreed contract; keep this unresolved case out of passing regression expectations.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Fresh product creation with description set to an empty string returned 400 with Product description is required. The unchanged creation schema permits the empty string. A nonempty description is a straightforward workaround.

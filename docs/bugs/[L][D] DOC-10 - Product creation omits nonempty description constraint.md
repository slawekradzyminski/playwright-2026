# [D] POST /api/v1/products — description schema permits a rejected empty string

Status: Open. Reproduced twice during follow-up exploration on 2026-09-10 at http://localhost:8081. Deployed revision unknown; live contract retained locally in ignored `exploration/products-openapi.json`.

## Evidence and reproduction

Authenticate as the configured admin. Submit a unique product name, description `""`, price 12.34, stockQuantity 2, category `Testing` and imageUrl `https://example.com/product.png`.

Actual: 400 `{"description":"Product description is required"}`. ProductCreateDto requires the description property but declares minLength 0 and maxLength 1000, so the supplied string satisfies the published constraints. A nonempty description succeeds. PUT of an existing disposable product with `{"description":""}` succeeds with 200 and persists the empty string; the update schema also declares minLength 0.

## Impact assessment

Swagger-derived clients lack the constraint needed to prevent a rejected creation. The server gives clear corrective guidance and a nonempty description works. No blocked core workflow or downstream outage was demonstrated.

Severity: **Low**. Category: Documentation.

## Expected correction and retest

Clarify the intended creation/update difference. If nonempty descriptions are required on creation, document that with minLength 1 and any intended whitespace restriction. If empty descriptions are intended, correct runtime validation instead. Retest empty/nonempty POST and PUT against the agreed contract; keep this unresolved case out of passing regression expectations.

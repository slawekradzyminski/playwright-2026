# Bug reporting

Use [TEMPLATE.md](TEMPLATE.md) for every finding and follow the [API testing skill](../../.agents/skills/api-testing/SKILL.md). Report suspicious behavior immediately, even if it still needs confirmation. Keep unknown details explicit; never invent evidence.

## Classification and naming

Keep filenames as `BUG-NNN-short-description.md`. Choose the next unused number across all types; keep the ID stable when triage changes the classification. The `Type` field distinguishes:

- **Functional**: incorrect application behavior, validation, permissions, persistence, or user-facing error messages.
- **Documentation/contract**: a discrepancy involving API documentation or schemas. This classification does not predetermine whether code or documentation needs correction.

Use one report for the same mismatch rather than duplicate functional and documentation reports. Record status, proposed severity with impact rationale, endpoint, environment, preconditions, exact reproduction, expected behavior and its source, actual behavior, evidence, cleanup, and follow-up. A suspected issue with an ambiguous requirement remains tracked until clarified. Severity reflects impact, not the issue type.

Documentation-only findings do not block tests of verified, intended runtime behavior. Link the report in a comment above affected tests; retain representative 400/401 coverage for each endpoint that returns those responses. Do not assert a functional defect as correct behavior.

## Existing findings

These reports preserve observations from 2026-09-07; formatting updates are not fresh verification.

| ID | Type | Status | Finding |
| --- | --- | --- | --- |
| [BUG-001](BUG-001-signup-overlong-username-validation.md) | Functional | Open | Wrong overlong-username validation message |
| [BUG-002](BUG-002-product-update-blank-fields.md) | Functional | Suspected | Update accepts blank catalog fields; requirement needs confirmation |
| [BUG-003](BUG-003-product-delete-error-body.md) | Documentation/contract | Open | DELETE 404 body differs from ErrorDto contract |
| [BUG-004](BUG-004-product-description-contract.md) | Documentation/contract | Open | Create rejects schema-permitted empty description |
| [BUG-005](BUG-005-qr-error-response-content-type-contract.md) | Documentation/contract | Open | QR error responses are documented as PNG instead of JSON |
| [BUG-006](BUG-006-cart-error-response-contract.md) | Documentation/contract | Open | Cart errors advertised as CartDto |
| [BUG-007](BUG-007-cart-stock-conflict-undocumented.md) | Documentation/contract | Open | Cart stock conflicts return undocumented 409 |
| [BUG-008](BUG-008-product-delete-referenced-by-cart.md) | Functional | Open | Deleting a product referenced by a cart returns 500 |
| [BUG-009](BUG-009-order-reopening-inventory.md) | Functional | Open | Cancelled orders may reopen without deducting restored stock |
| [BUG-010](BUG-010-auth-orders-error-contract.md) | Documentation/contract | Open | Auth/orders errors advertised as success DTOs |
| [BUG-011](BUG-011-order-invalid-status-unauthorized.md) | Functional | Open | Invalid order status body returns 401 for valid admin |
| [BUG-012](BUG-012-checkout-stock-conflict-undocumented.md) | Documentation/contract | Open | Checkout stock conflicts return undocumented 409 |
| [BUG-013](BUG-013-order-mutation-stale-updated-at.md) | Functional | Suspected | Order mutation updatedAt differs from persisted readback |

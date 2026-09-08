# Bug reporting

Use [TEMPLATE.md](TEMPLATE.md) for every finding and follow the [API testing skill](../../.agents/skills/api-testing/SKILL.md). Report suspicious behavior immediately, even if it still needs confirmation. Keep unknown details explicit; never invent evidence.

## Classification and naming

Keep filenames as `BUG-NNN-short-description.md`. Choose the next unused number across all types; keep the ID stable when triage changes the classification. The `Type` field distinguishes:

- **Functional**: incorrect application behavior, validation, permissions, persistence, or user-facing error messages.
- **Documentation/contract**: a discrepancy involving API documentation or schemas. This classification does not predetermine whether code or documentation needs correction.

Use one report for the same mismatch rather than duplicate functional and documentation reports. Record status, proposed severity with impact rationale, endpoint, environment, preconditions, exact reproduction, expected behavior and its source, actual behavior, evidence, cleanup, and follow-up. A suspected issue with an ambiguous requirement remains tracked until clarified. Severity reflects impact, not the issue type.

## Existing findings

These reports preserve observations from 2026-09-07; formatting updates are not fresh verification.

| ID | Type | Status | Finding |
| --- | --- | --- | --- |
| [BUG-001](BUG-001-signup-overlong-username-validation.md) | Functional | Open | Wrong overlong-username validation message |
| [BUG-002](BUG-002-product-update-blank-fields.md) | Functional | Suspected | Update accepts blank catalog fields; requirement needs confirmation |
| [BUG-003](BUG-003-product-delete-error-body.md) | Documentation/contract | Open | DELETE 404 body differs from ErrorDto contract |
| [BUG-004](BUG-004-product-description-contract.md) | Documentation/contract | Open | Create rejects schema-permitted empty description |
| [BUG-005](BUG-005-qr-error-response-content-type-contract.md) | Documentation/contract | Open | QR error responses are documented as PNG instead of JSON |

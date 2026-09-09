# BUG-043: Product creation silently rejects the apparently optional description

## Severity rationale

Administrators can fill every starred product field and submit, but creation fails without any visible explanation or guidance identifying Description. The values remain, so adding a description and resubmitting recovers without data loss; the missing requirement is not discoverable from the UI. This affects creation with an empty description and was reproduced with an isolated product. No broader outage or lost persisted product was observed.

## Classification

- Type: Functional
- Category: ux
- Tags: ux, functional, ui
- Status: Open
- Severity (proposed): medium

## Endpoint

UI `/admin/products/new`; `POST /api/v1/products`.

## Environment

- Observed on: 2026-09-09
- Base URL: http://localhost:8081
- Application version: deployed revision unknown; local frontend `41e177a6e4b4f53ffb75d0e37b0666dcb9508277`
- Requirement source: rendered starred required fields and product form, visible validation/recovery requirements in UI testing skill
- Identity: administrator; unique disposable product

## Preconditions

Open Add New Product as administrator.

## Reproduction

1. Fill a unique Product Name, Price `13.25`, Stock Quantity `4`, and Category `RootCRUD`. Leave Description and Image URL empty.
2. Activate Create Product. Inspect both visible feedback and the POST response.
3. Add a nonempty Description and submit again, then open Products from the admin navigation to verify persistence.

## Expected

A required description is identified before submission, or a server rejection is shown with actionable correction guidance. The UI must not silently reject a form that satisfies its displayed required fields. This report does not choose whether the backend should accept empty descriptions.

## Actual

Description has no required marker or client required validation. The first POST returns 400 with `{"description":"Product description is required"}`. The form stays visible with no description error, toast or alert; only console logging exposes the failure. Supplying a description produces 201 and the product is visible in the list. The form resets on success but does not navigate automatically; list navigation in reproduction is explicit.

## Evidence

[Supervisor review](../exploration/ui/2026-09-09-orders-root-01/review.md), `product-first-results.json`, scenarios `optional description missing` and `create corrected product`. DOM/source `AdminProductForm.tsx` catches errors with console logging only. The existing BUG-004 concerns the API schema discrepancy; this report covers the separate UI recovery failure.

![Form after rejected creation at 1440×900: no visible server error](../exploration/ui/2026-09-09-orders-root-01/screenshots/product-description-failed.png)

Screenshot inspected; evidence is Git-ignored and available only in the originating workspace. The textual steps are sufficient for another checkout.

## Impact

Administrators cannot tell why apparently valid product creation did nothing or which field to correct.

## Cleanup

The corrected disposable product is tracked for removal; final deletion outcome is in the supervisor review.

## Follow-up and automation

Expose server validation and align the description requirement with intended behavior. Keep this silent-failure scenario out of passing assertions. Ordinary create/edit/delete tests use verified nonempty descriptions and assert persisted UI data.

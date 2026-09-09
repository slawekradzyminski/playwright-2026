# Bug reporting

Use [TEMPLATE.md](TEMPLATE.md) for every finding. For API findings, follow the [API testing skill](../../.agents/skills/api-testing/SKILL.md); for UI findings, follow the [UI testing skill](../../.agents/skills/ui-testing/SKILL.md). Report suspicious behavior immediately, even if it still needs confirmation. Keep unknown details explicit; never invent evidence.

For UI findings, embed relevant inspected screenshots inline in the Markdown report, with a short state/viewport caption. Keep evidence local and Git-ignored, state its workspace-only availability, and retain textual reproduction steps for readers without the images.

## Classification and naming

Use `[S][T]-BUG-NNN-short-description.md`, for example `[H][A]-BUG-034-product-details-keyboard-inaccessible.md`. Keep the numeric ID stable across renames and allocate the next unused ID across all categories. The first bracket is severity; the second is category. Codes must match the full report fields. On reclassification, rename the file and update links, test comments and the index together; renaming is not fresh reproduction.

Filename legend: severity `[C]` critical, `[H]` high, `[M]` medium, `[L]` low; category `[A]` accessibility, `[P]` performance, `[UI]` UI, `[UX]` UX, `[F]` functional, `[D]` documentation/contract. Position distinguishes the two codes. Keep full lowercase names in report metadata and index columns.

Use one primary category in the filename and `Category` field:

| Category | Use for |
| --- | --- |
| `accessibility` | Keyboard access, accessible names, semantics, focus and assistive-technology barriers |
| `performance` | Measured latency, resource consumption or scalability defects |
| `ui` | Visual layout, clipping, alignment and rendering defects |
| `ux` | Discoverability, unnecessary effort, confusing journeys and recovery design |
| `functional` | Incorrect results, persistence, validation, permissions or state transitions |
| `contract` | Documentation/schema mismatches |

Choose the most specific category describing the observed user impact: keyboard barriers belong to accessibility even when the control is in the UI. Use `functional` for incorrect behavior that does not fit a more specific category. `Tags` may include additional categories and surface tags `api`/`ui`; use lowercase comma-separated values without repeating tags. Do not put every tag in the filename or duplicate a report across categories.

Keep `Type` separate: **Functional** describes a product defect (including visual, accessibility, UX and performance defects); **Documentation/contract** describes a documentation/schema discrepancy. This preserves the automation distinction: a contract finding alone does not prove runtime behavior is wrong. Category and severity do not determine which component must be fixed.

| Severity | Impact guide |
| --- | --- |
| `critical` | Widespread outage, severe data loss or similarly catastrophic impact |
| `high` | A core journey is blocked for an affected user group without a viable equivalent workaround, or serious unintended persistent mutation/integrity impact |
| `medium` | Materially impaired behavior with narrower impact or an available workaround |
| `low` | Limited impact, such as cosmetic defects or misleading wording with successful recovery |

### Explain impact before selecting severity

Before choosing a severity or filename tag, write `Severity rationale` immediately after the report title and before `Classification`. Describe the affected user and journey, exact observed consequence, scope/trigger, persistence or reversibility, and available recovery. State which consequences are only plausible and which observations or requirements are missing. A workaround must be usable by the affected group: mouse access does not solve keyboard exclusion, and clearing another customer's data is not automatically acceptable recovery.

Then select `Severity (proposed)` in Classification using the impact guide above. Do not begin with a level and retrofit its justification. The rationale should stand alone without repeating the severity label. Use concrete evidence rather than bug category, HTTP 500, axe impact labels or a hypothetical worst case as automatic severity rules. Keep reproduction confidence/status, scheduling priority and severity separate. If evidence is incomplete, state the provisional basis and what would change the assessment; do not invent a blocked journey or silently downgrade because a finding is suspected.

Compare materially similar findings for consistency, while explaining real differences in affected operations, recovery and state. Document explicit user severity decisions. During reassessment, preserve observation dates and avoid implying fresh execution; update the rationale, selected field, filename, index and references together. Report the changed levels and remaining uncertainty.

Propose severity from demonstrated impact and retain a rationale in the report. These are impact levels, not scheduling priority. Do not automatically lower accessibility/contract findings or elevate suspected findings; keep confidence in `Status`, not the severity tag. Preserve existing assessments during a naming-only migration.

Quick literal filters (brackets are shell/glob metacharacters): `rg --files reports/bugs | rg -F '[H]'` for high, `rg -F '[M]'` for medium, `rg -F '[L]'` for low, and `rg -F '[A]'` for accessibility. Quote filenames in shell commands. The index below exposes severity, category and status together. Proposed optimizations without a demonstrated defect remain in `reports/improvements`.

Delete reports confirmed to be false positives caused by probe, setup or interpretation errors, together with their references; do not retain them as closed or not-reproduced bugs. A failed reproduction alone leaves a finding unresolved.

Use one report for the same mismatch rather than duplicate functional and documentation reports. Record status, proposed severity with impact rationale, endpoint, environment, preconditions, exact reproduction, expected behavior and its source, actual behavior, evidence, cleanup, and follow-up. A suspected issue with an ambiguous requirement remains tracked until clarified. Severity reflects impact, not the issue type.

Documentation-only findings do not block tests of verified, intended runtime behavior. Link the report in a comment above affected tests; retain representative 400/401 coverage for each endpoint that returns those responses. Do not assert a functional defect as correct behavior.

## Severity review

[Evidence-first reassessment of all 32 findings](severity-review-2026-09-09.md) records the impact rationale before each selected severity. This is document triage, not fresh runtime verification.

## Existing findings

Older reports preserve their original observation dates. Inventory/accounts/prompts findings below include verification on 2026-09-08.

| ID | Severity | Category | Type | Status | Finding |
| --- | --- | --- | --- | --- | --- |
| [BUG-001]([L][F]-BUG-001-signup-overlong-username-validation.md) | low | functional | Functional | Open | Wrong overlong-username validation message |
| [BUG-002]([M][F]-BUG-002-product-update-blank-fields.md) | medium | functional | Functional | Suspected | Update accepts blank catalog fields; requirement needs confirmation |
| [BUG-003]([L][D]-BUG-003-product-delete-error-body.md) | low | contract | Documentation/contract | Open | DELETE 404 body differs from ErrorDto contract |
| [BUG-004]([M][D]-BUG-004-product-description-contract.md) | medium | contract | Documentation/contract | Open | Create rejects schema-permitted empty description |
| [BUG-005]([M][D]-BUG-005-qr-error-response-content-type-contract.md) | medium | contract | Documentation/contract | Open | QR error responses are documented as PNG instead of JSON |
| [BUG-006]([M][D]-BUG-006-cart-error-response-contract.md) | medium | contract | Documentation/contract | Open | Cart errors advertised as CartDto |
| [BUG-007]([M][D]-BUG-007-cart-stock-conflict-undocumented.md) | medium | contract | Documentation/contract | Open | Cart stock conflicts return undocumented 409 |
| [BUG-008]([M][F]-BUG-008-product-delete-referenced-by-cart.md) | medium | functional | Functional | Open | Deleting a product referenced by a cart returns 500 |
| [BUG-009]([H][F]-BUG-009-order-reopening-inventory.md) | high | functional | Functional | Open | Cancelled orders may reopen without deducting restored stock |
| [BUG-010]([M][D]-BUG-010-auth-orders-error-contract.md) | medium | contract | Documentation/contract | Open | Auth/orders errors advertised as success DTOs |
| [BUG-011]([M][F]-BUG-011-order-invalid-status-unauthorized.md) | medium | functional | Functional | Open | Invalid order status body returns 401 for valid admin |
| [BUG-012]([M][D]-BUG-012-checkout-stock-conflict-undocumented.md) | medium | contract | Documentation/contract | Open | Checkout stock conflicts return undocumented 409 |
| [BUG-013]([L][F]-BUG-013-order-mutation-stale-updated-at.md) | low | functional | Functional | Suspected | Order mutation updatedAt differs from persisted readback |
| [BUG-014]([M][F]-BUG-014-inventory-malformed-request-id-401.md) | medium | functional | Functional | Suspected | Malformed inventory adjustment UUID returns 401 for a valid administrator |
| [BUG-015]([M][D]-BUG-015-inventory-invalid-query-and-path-error-schema.md) | medium | contract | Documentation/contract | Open | Inventory error statuses and schemas missing or incorrect |
| [BUG-020]([M][D]-BUG-020-user-read-error-schemas.md) | medium | contract | Documentation/contract | Open | User read authentication errors modeled as successful DTOs |
| [BUG-021]([M][D]-BUG-021-user-edit-error-schemas.md) | medium | contract | Documentation/contract | Open | User edit error responses modeled as UserEntity |
| [BUG-022]([L][F]-BUG-022-cart-read-after-account-deletion-500.md) | low | functional | Functional | Suspected | Cart read with a deleted-user token returns 500 |
| [BUG-027]([M][D]-BUG-027-prompt-error-schema-mismatch.md) | medium | contract | Documentation/contract | Open | Prompt authentication errors modeled as prompt DTOs |
| [BUG-028]([H][F]-BUG-028-register-sign-in-creates-account.md) | high | functional | Functional | Open | Registration Sign in button also creates an account when the form is valid |
| [BUG-029]([L][UI]-BUG-029-mobile-toasts-cover-footer-actions.md) | low | ui | Functional | Suspected | Mobile bottom toasts overlap footer actions; placement requirement needs clarification |
| [BUG-030]([M][UI]-BUG-030-homepage-mobile-welcome-clipping.md) | medium | ui | Functional | Open | Mobile welcome panel clips text |
| [BUG-031]([L][UI]-BUG-031-mobile-menu-logout-alignment.md) | low | ui | Functional | Open | Mobile Logout label centered unlike adjacent account links |
| [BUG-032]([L][UI]-BUG-032-mobile-menu-footer-overlap.md) | low | ui | Functional | Suspected | Expanded mobile menu obscures footer heading |
| [BUG-033]([M][UI]-BUG-033-product-category-badge-clipping.md) | medium | ui | Functional | Open | Long category badge is clipped by product cards |
| [BUG-034]([H][A]-BUG-034-product-details-keyboard-inaccessible.md) | high | accessibility | Functional | Open | Product details cannot be opened using keyboard navigation |
| [BUG-035]([M][F]-BUG-035-product-search-surrounding-spaces.md) | medium | functional | Functional | Open | Search fails when pasted name has surrounding spaces |
| [BUG-036]([M][UX]-BUG-036-product-categories-push-search-below-fold.md) | medium | ux | Functional | Open | Category list pushes search and products below initial viewport |
| [BUG-037]([L][F]-BUG-037-empty-catalog-category-count.md) | low | functional | Functional | Open | Empty catalog reports one category |
| [BUG-038]([L][UI]-BUG-038-qr-mobile-image-distortion.md) | low | ui | Functional | Open | QR image loses its square aspect ratio on narrow screens |
| [BUG-039]([M][A]-BUG-039-cart-link-accessible-name.md) | medium | accessibility | Functional | Open | Shared header cart link has no accessible name |
| [BUG-040]([M][A]-BUG-040-profile-invalid-field-semantics.md) | medium | accessibility | Functional | Open | Invalid profile email is not exposed as invalid or associated with its error |
| [BUG-041]([M][A]-BUG-041-order-status-select-accessible-name.md) | medium | accessibility | Functional | Open | Admin order-status select has no accessible name |
| [BUG-042]([M][A]-BUG-042-checkout-validation-error-contrast.md) | medium | accessibility | Functional | Open | Checkout validation text fails contrast |
| [BUG-043]([M][UX]-BUG-043-product-create-silent-description-rejection.md) | medium | ux | Functional | Open | Product creation silently rejects an apparently optional description |
| [BUG-044]([M][UI]-BUG-044-admin-tables-clip-columns-on-narrow-viewports.md) | medium | ui | Functional | Open | Admin product and order tables clip action columns on narrow viewports |
| [BUG-045]([H][A]-BUG-045-inventory-rows-keyboard-inaccessible.md) | high | accessibility | Functional | Open | Inventory rows cannot be selected with the keyboard |
| [BUG-046]([M][F]-BUG-046-admin-dashboard-aggregates-only-first-50-orders.md) | medium | functional | Functional | Open | Admin dashboard aggregates only the first 50 orders |
| [BUG-047]([L][F]-BUG-047-order-route-rounds-large-identifiers.md) | low | functional | Functional | Open | Order route rounds large identifiers and requests an invalid ID |
| [BUG-048]([M][D]-BUG-048-ollama-error-response-contract.md) | medium | contract | Documentation/contract | Open | Ollama error responses do not match advertised streams |
| [BUG-049]([M][F]-BUG-049-ollama-chat-repeats-first-prompt.md) | medium | functional | Functional | Open | Mock chat repeats the first scenario instead of answering a follow-up |
| [BUG-050]([M][A]-BUG-050-llm-collapsed-settings-focusable.md) | medium | accessibility | Functional | Open | Collapsed LLM settings expose invisible keyboard stops |
| [BUG-051]([M][UX]-BUG-051-llm-mobile-chat-input-too-narrow.md) | medium | ux | Functional | Open | Mobile chat input and transcript are excessively narrow |
| [BUG-052]([L][A]-BUG-052-chat-role-badges-invalid-aria-label.md) | low | accessibility | Functional | Open | Chat role badges use prohibited aria-label |
| [BUG-053]([M][UI]-BUG-053-tool-call-arguments-overflow-mobile.md) | medium | ui | Functional | Open | Tool-call arguments overflow narrow bubbles |
| [BUG-054]([M][F]-BUG-054-chat-error-retry-invalid-history.md) | medium | functional | Functional | Open | Plain chat cannot recover after a failed request |
| [BUG-055]([M][F]-BUG-055-tool-chat-unlocks-before-final-answer.md) | medium | functional | Functional | Open | Tool chat unlocks input before the response finishes |

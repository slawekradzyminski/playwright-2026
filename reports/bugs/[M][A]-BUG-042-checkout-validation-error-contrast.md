# BUG-042: Checkout validation errors fail color contrast

## Severity rationale

Users who submit checkout with blank fields receive error text rendered in low contrast against the white form surface. The issue affects every required checkout field and makes the recovery guidance harder to read, although the fields remain editable and keyboard focus remains available. A user can recover by relying on the field position or browser tooling; no alternate high contrast message was observed. The automated finding was reproduced on the checkout validation state; assistive technology behavior was not assessed.

## Classification

- Type: Functional
- Category: accessibility
- Tags: accessibility, ui
- Status: Open
- Severity (proposed): Medium

## Endpoint

`GET /checkout` (client-side validation state)

## Environment

- Observed on: 2026-09-09
- Base URL: http://localhost:8081
- Application version: deployed revision unknown; local frontend revision 41e177a
- Contract source/version: `/Users/slawek/IdeaProjects/vite-react-frontend/src/components/checkout/CheckoutForm.tsx`
- Identity: disposable customer; no credentials retained

## Preconditions

Disposable authenticated customer with two disposable products in cart.

## Reproduction

1. Open `/checkout` with a populated cart.
2. Activate `data-testid="checkout-submit-button"` while all five fields are blank.
3. Run axe on the rendered validation state.

## Expected

Validation messages should meet the applicable text contrast threshold and clearly identify recovery guidance.

## Actual

axe reported `color-contrast` with impact `serious` for `checkout-street-error`, `checkout-city-error`, `checkout-state-error`, `checkout-zip-error`, and `checkout-country-error`. Supervisor reproduction with axe 4.13.0 measured **3.67:1** for all five: foreground `#fb2c36`, background `#fbfbfa`, normal 14px text, required **4.5:1**. The rendered color differs from older Tailwind defaults; source-token guesses are not evidence.

## Evidence

- Exploration scenario: `checkout blank validation` in [local review](../exploration/ui/2026-09-09-checkout-luna-01/review.md)
- Screenshot: [05-checkout-validation-desktop-1440x900.png](../exploration/ui/2026-09-09-checkout-luna-01/screenshots/05-checkout-validation-desktop-1440x900.png)
- [Supervisor axe JSON](../exploration/ui/2026-09-09-orders-root-01/checkout-quality.json) independently confirms all five nodes.
- Local Git-ignored screenshot, validation at 1440px:

![Checkout validation contrast](../exploration/ui/2026-09-09-orders-root-01/screenshots/checkout-contrast-root.png)

## Impact

Checkout users with validation errors may have difficulty reading the only recovery instruction for each field. The issue is limited to the validation state and has an available mouse/keyboard correction path.

## Cleanup

Agent disposable fixtures were removed; supervisor fixture cleanup is recorded in the consolidated review.

## Follow-up and automation

Verify with axe and manual contrast inspection after the text color is adjusted.

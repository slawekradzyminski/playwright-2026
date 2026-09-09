# BUG-029: Mobile bottom toasts overlap footer actions

## Classification

- Type: Functional
- Status: Suspected
- Severity (proposed): Low — a transient notification obscures part of the footer action area; whether placement should change needs confirmation.

## Endpoint

UI `/register` and signup success destination `/login` at 360 × 800.

## Environment

- Observed on: 2026-09-08
- Base URL: http://localhost:8081
- Browser: Chromium 152, macOS, desktop context resized to 360 × 800
- Application version: deployed revision not exposed; local frontend reference `41e177a6e4b4f53ffb75d0e37b0666dcb9508277`
- Identity: anonymous using disposable registration data

## Preconditions

Use a disposable account created through SignupClient for a duplicate-account rejection, or register a new disposable account successfully.

## Reproduction

1. Open `/register` at 360 × 800 and fill valid fields with an existing disposable username.
2. Submit the form and wait for the notification's entrance animation to finish.
3. At the lower scroll position, observe the fixed bottom notification over the footer links.
4. Alternatively, complete a successful signup and observe the success toast at the bottom of `/login`.

## Expected

Assumption awaiting design clarification: feedback should leave underlying actions unobscured, or provide an agreed way to reach them while it is displayed. The user requested a report about the bottom toasts; the precise desired position has not been specified. Bottom placement by itself does not establish a defect.

## Actual

The settled mobile toast is fully inside the viewport, but overlays footer content. The success toast covers part of the lower footer action area. A close control is visible. Whether an intended action is blocked in practice has not yet been established. Desktop/tablet notifications appear at the top right.

Early screenshots containing cut-off toast text captured the entrance animation, not persistent clipping; they are not evidence of a clipping defect. The simulated 503 produces an inline form error, not this toast, and is not a backend outage.

## Evidence

- [Settled mobile duplicate toast](../exploration/ui/2026-09-08-registration-1339/screenshots/duplicate-settled-360.png)
- [Settled mobile success toast](../exploration/ui/2026-09-08-registration-1339/screenshots/success-settled-mobile.png)
- [Exploration index](../exploration/ui/2026-09-08-registration-1339/review.md)

Images were inspected and are available only in the originating workspace; they are Git-ignored. Overlap is visible in both states; no persistent text clipping was observed after animation.

Settled duplicate-account notification at 360 × 800:

![Mobile error toast overlapping footer actions](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-08-registration-1339/screenshots/duplicate-settled-360.png)

Settled signup-success notification at 360 × 800:

![Mobile success toast overlapping footer actions](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-08-registration-1339/screenshots/success-settled-mobile.png)

## Impact

Potential temporary obstruction of footer actions on narrow screens. A usability concern is established for review; the acceptance criterion and severity remain provisional.

## Cleanup

Disposable exploration accounts were deleted through the existing API cleanup helper.

## Follow-up and automation

Confirm intended placement/obstruction policy and assess action hit testing while the toast is visible. Do not encode a placement expectation in automated tests before that decision. Keep functional toast-message assertions for verified registration outcomes.

## Product catalog follow-up — 2026-09-09

Reproduced with live cart actions at 360 × 800. A settled “Added to cart” notification covers lower footer actions; stacked notifications can also cover card actions depending on scroll position. This adds evidence to the existing placement finding, without resolving its original design question.

![Settled catalog cart notification](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/screenshots/cart-mobile-settled.png)

[Product exploration review](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/review.md). Images are ignored and available only in the originating workspace, not another checkout or GitHub. The customer cart was cleared after the scenario.

# BUG-040: Invalid profile email is not exposed as invalid or associated with its error

## Severity rationale

Invalid email feedback is visible and focus moves to the field, but the input exposes neither its invalid state nor an error association. This impairs accessible correction of the form. A role=alert message exists and actual screen-reader behavior was not tested, so the record does not establish that correction is impossible.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional
- Category: accessibility
- Tags: accessibility, ui
- Status: Open
- Severity (proposed): Medium

## Endpoint

UI `/profile`

## Environment

- Observed on: 2026-09-09
- Base URL: http://localhost:8081
- Application version: deployed revision not established
- Identity: disposable customer; Chromium desktop context on macOS

## Preconditions

Customer created through existing API fixture helpers; authenticated browser state.

## Reproduction

1. Enter bad in Email and select Save Changes. Inspect the focused input attributes.

## Expected

Expose invalid state and associate the field with its error, following the skill accessibility reference.

## Actual

Visible Invalid email format alert appears and focus moves to Email, but aria-invalid and aria-describedby are both absent. Actual screen-reader announcement was not tested.

## Evidence

![Invalid profile email is not exposed as invalid or associated with its error](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-profile-qr-skill-trial/screenshots/profile-validation.png)

[Trial evidence](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-profile-qr-skill-trial) includes layout measurements and axe results. Images are Git-ignored and available only in the originating workspace.

## Impact

Medium: focused field does not expose its validation state or error association to assistive technology.

## Cleanup

Owned account cleanup is tracked in the trial review.

## Follow-up and automation

Fix and re-explore the affected behavior before adding regression assertions for this defect. Do not assert the defective state as correct. Continue verified functional journeys.

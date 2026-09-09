# BUG-039: Shared header cart link has no accessible name

## Severity rationale

The shared cart link is focusable but has no accessible name in five scanned states, so assistive-technology users cannot identify its purpose from the link semantics. This materially impairs navigation. Activation failure or absence of every alternative cart route was not established, so a complete cart-access block is not claimed.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional
- Category: accessibility
- Tags: accessibility, ui
- Status: Open
- Severity (proposed): Medium

## Endpoint

UI `/profile and /qr`

## Environment

- Observed on: 2026-09-09
- Base URL: http://localhost:8081
- Application version: deployed revision not established
- Identity: disposable customer; Chromium desktop context on macOS

## Preconditions

Customer created through existing API fixture helpers; authenticated browser state.

## Reproduction

1. Open either page as a customer at 1440×900. Inspect the desktop cart link in the accessibility tree and run axe.

## Expected

The cart navigation link exposes a meaningful accessible name; see the skill accessibility reference.

## Actual

axe link-name fails for data-testid desktop-cart-icon in all five scanned states. Anchor is in tab order but has no accessible text, aria-label, aria-labelledby or title.

## Evidence

![Shared header cart link has no accessible name](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-profile-qr-skill-trial/screenshots/profile-1440.png)

[Trial evidence](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-profile-qr-skill-trial) includes layout measurements and axe results. Images are Git-ignored and available only in the originating workspace.

## Impact

Medium: keyboard/screen-reader users encounter an unnamed navigation action.

## Cleanup

Owned account cleanup is tracked in the trial review.

## Follow-up and automation

Fix and re-explore the affected behavior before adding regression assertions for this defect. Do not assert the defective state as correct. Continue verified functional journeys.

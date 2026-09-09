# BUG-038: QR image loses its square aspect ratio on narrow screens

## Severity rationale

The square QR image is squeezed horizontally at 360px and more at 320px. The 360px screenshot still decodes to the submitted content, so current evidence establishes visual distortion rather than failure of the primary QR task. Decoding at 320px and with physical scanners was not established; that limitation does not prove failure.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional
- Category: ui
- Tags: ui
- Status: Open
- Severity (proposed): Low

## Endpoint

UI `/qr`

## Environment

- Observed on: 2026-09-09
- Base URL: http://localhost:8081
- Application version: deployed revision not established
- Identity: disposable customer; Chromium desktop context on macOS

## Preconditions

Customer created through existing API fixture helpers; authenticated browser state.

## Reproduction

1. Generate a QR code at 360×800, then resize to 320px and 372px.

## Expected

Preserve the square proportions of the 400×400 source image while fitting the container. Source: the generated square PNG and responsive visual containment expectations.

## Actual

Image renders at 244×256 at 360px and 204×256 at 320px; restores 256×256 at 372px. No document overflow. jsQR decoded the 360px screenshot to the exact submitted URL.

## Evidence

![QR image loses its square aspect ratio on narrow screens](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-profile-qr-skill-trial/screenshots/qr-360.png)

[Trial evidence](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-profile-qr-skill-trial) includes layout measurements and axe results. Images are Git-ignored and available only in the originating workspace.

## Impact

Low: visible distortion; tested 360px screenshot still decodes successfully.

## Cleanup

Owned account cleanup is tracked in the trial review.

## Follow-up and automation

Fix and re-explore the affected behavior before adding regression assertions for this defect. Do not assert the defective state as correct. Continue verified functional journeys.

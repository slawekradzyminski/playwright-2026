# BUG-033: Long category badge is clipped by product cards

## Classification

- Type: Functional
- Status: Open
- Severity (proposed): Medium: catalog category text is lost on all sampled layouts.

## Endpoint

UI `/products`

## Environment

- Observed on: 2026-09-09
- Base URL: http://localhost:8081
- Application version: not recorded; Chromium on macOS
- Identity: disposable regular customer; products created using administrator API client

## Preconditions

Disposable Probe products and existing seed catalog. No production data.

## Reproduction

1. Create a product with category ProbeLongCategoryLongCategoryLongCategory; visit /products and search its name; inspect at 1440, 768 and 360px.

## Expected

The category stays within the card or uses an explicit readable truncation treatment. Expectation: content containment in docs/ui-exploration.md.

## Actual

The badge runs beyond the card edge with no ellipsis. At 1440px the content clientWidth is 286px but scrollWidth is 443px; the card clips overflow. At 360px those values are 326px and 443px.

## Evidence

[Complete exploration review](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/review.md). Functional results in functional.json; keyboard and containment measurements in cards.json.

![Long category badge is clipped by product cards](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/screenshots/long-card-1440.png)

Images and exploration files are Git-ignored and available only in the originating workspace; they will not render in another checkout or on GitHub without separately shared evidence.

## Impact

Medium: catalog category text is lost on all sampled layouts.

## Cleanup

Disposable resources are owned by this exploration; final cleanup outcome is recorded in the review.

## Follow-up and automation

Excluded from passing regression expectations while open. No expected-failure tests. Verify the intended behavior after a fix.

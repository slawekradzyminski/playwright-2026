# BUG-036: Category list pushes search and products below initial viewport

## Severity rationale

With ten categories, search and products are pushed below the initial viewport at several widths, contrary to the confirmed discoverability requirement. Users must scroll past a substantial filter list before browsing. Scrolling still reaches the controls; there is no demonstrated complete browsing block or measured latency defect.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional
- Category: ux
- Tags: ux, ui
- Status: Open
- Severity (proposed): Medium

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

1. Open /products with 12 products across 10 categories at 360x800, 768x1024 or 1279x900; start at the top.

## Expected

User requirement confirmed on 2026-09-09: search and initial products should be readily discoverable through compact or collapsible category filters.

## Actual

At 360px the initial viewport shows the hero and part of categories only; at 1279px the category panel spans almost all remaining height. Search and products are below the viewport.

## Evidence

[Complete exploration review](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/review.md). Functional results in functional.json; keyboard and containment measurements in cards.json.

![Category list pushes search and products below initial viewport](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/screenshots/catalog-360-top.png)

Images and exploration files are Git-ignored and available only in the originating workspace; they will not render in another checkout or on GitHub without separately shared evidence.

## Impact

Medium: primary catalog browsing requires scrolling past every category.

## Cleanup

Disposable resources are owned by this exploration; final cleanup outcome is recorded in the review.

## Follow-up and automation

Excluded from passing regression expectations while open. No expected-failure tests. User confirmed this as a UX defect; verify after a fix.

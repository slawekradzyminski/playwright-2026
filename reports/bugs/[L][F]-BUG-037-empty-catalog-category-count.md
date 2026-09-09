# BUG-037: Empty catalog incorrectly reports one category

## Severity rationale

An empty mocked catalog is summarized as having one category while the category panel correctly reports none. This creates contradictory summary information, but no products or categories are actually fabricated in the list. Evidence covers simulated empty/loading/error states, not a corrupted backend catalog.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional
- Category: functional
- Tags: functional, ui
- Status: Open
- Severity (proposed): Low

## Endpoint

UI `/products`, `GET /api/v1/products`

## Environment

- Observed on: 2026-09-09
- Base URL: http://localhost:8081
- Application version: not recorded
- Browser: Chromium 152.0.7977.77 on macOS, 360 × 800
- Identity: disposable regular customer
- Evidence mode: mixed; catalog response mocked, other requests live

## Preconditions

Intercept the catalog request with HTTP 200 and JSON `[]`. No backend catalog deletion is required.

## Reproduction

1. Fulfill `GET /api/v1/products` with `[]`.
2. Reload `/products` and wait for “No products found”.
3. Compare the hero summary and category panel.

## Expected

Zero products have zero categories. The summary agrees with the category panel and response data.

## Actual

The summary says “0 products across 1 categories”; the panel says “No categories found (Total products: 0)”. The same misleading summary is visible while loading and after a simulated 503, when a count is not established.

## Evidence

![Empty catalog at 360 × 800](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/screenshots/empty-catalog-mobile.png)

[Complete exploration review](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/review.md), scenario `empty catalog`. Screenshot and JSON evidence are ignored and available only in this workspace; they will not render in another checkout or on GitHub without separately shared evidence.

## Impact

Conflicting counts undermine confidence in the catalog state.

## Cleanup

The interception was removed. Live catalog reload recovered successfully. No backend data was changed by this simulation.

## Follow-up and automation

The empty-state regression checks the verified panel and recovery behavior. It deliberately omits the defective hero count; no expected-failure assertion was added.

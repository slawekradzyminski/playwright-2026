# BUG-035: Search fails when pasted name has surrounding spaces

## Classification

- Type: Functional
- Status: Open
- Severity (proposed): Medium: common pasted queries produce misleading empty results.

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

1. Search Probe Alpha, then replace query with two spaces + Probe Alpha + two spaces.

## Expected

Trim leading and trailing search whitespace, confirmed by the user on 2026-09-09.

## Actual

Probe Alpha matches; the padded query returns no products.

## Evidence

[Complete exploration review](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/review.md). Functional results in functional.json; keyboard and containment measurements in cards.json.

Images and exploration files are Git-ignored and available only in the originating workspace; they will not render in another checkout or on GitHub without separately shared evidence.

## Impact

Medium: common pasted queries produce misleading empty results.

## Cleanup

Disposable resources are owned by this exploration; final cleanup outcome is recorded in the review.

## Follow-up and automation

Excluded from passing regression expectations while open. No expected-failure tests. Verify the intended behavior after a fix.

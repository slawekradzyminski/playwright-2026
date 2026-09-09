# BUG-034: Product details cannot be opened using keyboard navigation

## Severity rationale

Keyboard traversal skips the product title/image action and reaches quantity/cart controls instead; the clickable card has no keyboard interaction. Keyboard-only customers cannot open product details through the catalog journey. Mouse access is not an equivalent workaround for that affected group; the main information-access route is blocked.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional
- Category: accessibility
- Tags: accessibility, ui
- Status: Open
- Severity (proposed): High

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

1. Search Probe Alpha; focus Sort by; press Tab repeatedly. Try reaching the card title or image using Tab.

## Expected

The action that opens product details is keyboard focusable and activatable. Expected functional equivalence with clicking the card.

## Actual

Focus goes from sort directly to minus, plus, Add to Cart, then footer links. The card is a div with a click handler, no link, role or tabindex.

## Evidence

[Complete exploration review](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/review.md). Functional results in functional.json; keyboard and containment measurements in cards.json.

Images and exploration files are Git-ignored and available only in the originating workspace; they will not render in another checkout or on GitHub without separately shared evidence.

## Impact

High: keyboard-only customers cannot reach product information from catalog cards.

## Cleanup

Disposable resources are owned by this exploration; final cleanup outcome is recorded in the review.

## Follow-up and automation

Excluded from passing regression expectations while open. No expected-failure tests. Verify the intended behavior after a fix.

# IMP-001: Investigate product catalog latency and bounded retrieval

- Status: Needs investigation
- Reported on: 2026-09-09
- Journey: `/products`, `GET /api/v1/products`
- Environment: http://localhost:8081; application version not recorded

## Evidence

The user reports product endpoint responses taking seconds despite a small catalog. This latency has not been independently measured as part of this proposal; no response-time target is established.

The preceding product exploration observed one complete array of 8 seed products, later 12 including disposable fixtures, and client-side search, category filtering and sorting. The observed UI used the full-list request, with no pagination controls. This establishes the explored retrieval behavior; it does not prove that all possible backend pagination parameters are unsupported.

[Local product exploration](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-products-01/review.md). Evidence is ignored and available only in the originating workspace; the textual observations above remain usable in other checkouts.

## Potential impact

Users may wait unnecessarily before browsing. Full-catalog retrieval and rendering may become more expensive as record count grows. Lack of pagination does not by itself explain a multi-second response for 8–12 records; current latency and growth behavior need separate investigation.

## Proposed investigation

1. Measure initial load and 3–5 repeat loads, recording record count, payload size, request duration, time to first byte where available, cache conditions and time until usable products.
2. Separate request latency from rendering and image loading; inspect duplicate requests, retries and known environment delays. Use server evidence before attributing time to database or backend processing.
3. Establish the intended catalog scale and acceptable response/UI latency. Check whether the API supports a bounded retrieval contract and whether the UI uses it.
4. Evaluate pagination or another bounded retrieval approach, with compatible search, sorting, category counts and navigation behavior. Do not prescribe pagination as a fix for unmeasured latency.

## Validation plan

Retain a reproducible baseline and compare equivalent conditions after any change. Verify that bounded retrieval preserves full-catalog search/filter/sort semantics, handles empty/last pages and avoids duplicate or missing records. Any larger dataset or load test requires an appropriately scoped test environment and cleanup plan.

No live probes, load tests or application changes were performed for this instruction update. Promote a demonstrated performance defect to the bug workflow and link it here.

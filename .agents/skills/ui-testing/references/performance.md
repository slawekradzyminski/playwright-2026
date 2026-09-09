## Required performance and scalability review

Include a lightweight performance review in every exploration. Measure the primary page load and data-dependent interactions under normal use, including search, filtering, sorting and navigation where applicable. Passing functional assertions does not establish acceptable speed. This review is not a load test and does not require generating a large dataset or concurrent traffic.

| Area | Required evidence and questions |
| --- | --- |
| User-visible delay | Measure from navigation/action to usable content or completion feedback. Record the completion condition. Does the page remain responsive, show useful loading feedback and prevent accidental duplicate submissions? |
| Request timing | Record method, route, status and duration for relevant requests. Where available, distinguish time to first byte, response download and subsequent rendering. Do not label browser-observed duration as backend processing time without server evidence. |
| Repeatability | Record an initial load separately from a small set of repeat observations (normally 3–5). State sample count, individual timings and range/median, cache conditions, dataset size and known environmental factors. Do not present a small sample as a production percentile or SLA result. |
| Payload and request count | Record returned record count, payload/transfer size when available and requests per action. Investigate duplicate fetches, retries, request waterfalls and unexpectedly fetching full datasets for a small visible result. Distinguish intentional polling or retry policy from unexplained traffic. |
| Growth and pagination | For lists, check whether API results are bounded by pagination/limits and whether the UI actually uses them. Consider server-side search/sort/filtering, image loading and rendering cost as data grows. Missing pagination is a scalability concern to assess, not automatically a proven defect or the cause of current latency. |

Use browser network/performance evidence alongside the existing observer. Its timestamps alone do not capture time until usable UI or separate server processing from transport/rendering; supplement them with explicit measurements. Save sanitized timings and summaries in the exploration directory, label simulated delays separately and record measurement gaps. Do not silently run stress tests or create large shared datasets as part of this checklist.

Compare measurements with an agreed performance target when one exists. Without a target, flag repeatable multi-second waits on small datasets as suspected problems worth investigation; do not invent a universal pass/fail threshold or infer a cause such as a missing database index. Record the measured user impact, competing explanations and the next diagnostic step. Ask a focused question when an expected latency or intended scale materially affects classification, while continuing independent work.

Report a demonstrated regression or requirement violation through [the bug workflow](../../../../reports/bugs/README.md). Use a suspected bug when observed behavior may be defective but evidence or expectations remain incomplete. Record a proposed optimization or future scalability concern in [improvements](../../../../reports/improvements/README.md), with evidence, expected benefit, unknowns and a validation plan. Link related records rather than reporting the same issue twice. User-reported latency must remain labeled as user-reported until measured.

Include a performance summary in `review.md`: actual measurements, dataset and cache conditions, request counts, pagination findings, bugs/improvements and untested scaling assumptions. Keep functional automation free of arbitrary timing assertions; add performance budgets only when their threshold and measurement environment are established.

Sources reviewed on 2026-09-08. Revisit the viewport sample when product requirements or observed usage justify it.

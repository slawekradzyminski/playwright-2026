---
name: ui-testing
description: Plan, explore, and implement functional UI tests with page objects and API fixtures. Use for UI test work, including visual, accessibility, UX and performance exploration before automation; not for API-only testing or application implementation.
---

# UI Testing

Build focused regression coverage from verified user journeys. Passing functional assertions do not establish visual quality, accessibility or acceptable speed.

## Scope and assessment

Read applicable agent instructions, requirements, project docs, existing page objects, fixtures, API clients and bug reports. Inspect relevant frontend behavior and lower-level test assertions when available; record missing source or deployed-revision evidence. Requirements define correctness; source explains behavior and risks. Prefer UI coverage for distinct browser/user integration risks rather than repeating API validation permutations.

Preserve the requested feature and environment. Resolve routine choices from repository context. Instruction-only edits require link, consistency and skill validation; implementation requests continue through exploration, automation and suite verification. Do not expand testing into application fixes or unrelated audits.

## Explore before automating

Write a scenario plan before browser actions: expected outcomes and their sources, disposable data, primary journeys, representative validation/error/recovery states and coverage gaps. Use the available playwright-cli skill for browser exploration. Running existing tests or reading source does not replace current exploration.

Read these references before the corresponding phase; all review dimensions apply to UI exploration, with non-applicable checks recorded explicitly:

- [Exploration](references/exploration.md): viewport sampling, states, capture and inspection procedure.
- [Evidence and bugs](references/evidence-and-bugs.md): read before first navigation for observer setup, sanitized evidence, review index and triage.
- [Visual review](references/visual-review.md): inspect every image and distinguish exploratory review from visual regression automation.
- [Accessibility](references/accessibility.md): keyboard, focus, semantics, zoom, contrast and axe checks.
- [UX](references/ux.md): discoverability, input expectations, consistency and recovery.
- [Performance](references/performance.md): repeat measurements, request/payload analysis and growth risks.

These references contain the maintained workflow, replacing the former project exploration document. Repository-specific paths and commands apply to playwright-2026; discover equivalents in other projects. Use API clients for disposable setup and cleanup and retain a unique ignored evidence directory. No Docker setup is required by this skill.

## Findings and expectations

Write the impact rationale before selecting severity, following [evidence and bugs](references/evidence-and-bugs.md). Report confirmed and suspected defects promptly under `reports/bugs`, following its README and template, including severity/category filenames and report tags. Link inspected screenshots for visual findings and retain reproducible text. Record performance/scalability proposals under `reports/improvements` when applicable. Do not infer root causes or invent latency budgets.

Ask only about a specific unresolved expectation, with relevant evidence, and continue independent scenarios. Defer assertions affected by that uncertainty. Do not encode a functional defect as passing behavior, conceal it with a skip, or require approval of the whole screenshot gallery. Document gaps and bug references instead. Documentation-only defects can retain verified intended coverage with a bug-reference comment.

## Automate verified journeys

Use existing framework conventions and page objects, initializing the page object under test in `test.beforeEach`. Prefer `data-testid`, then meaningful roles/names; avoid positional selectors and arbitrary sleeps. Keep setup and cleanup in API fixtures with unique disposable resources and cleanup on failure. Add helpers only when needed for the selected journey.

Use given (setup), when (tested action), then (observable assertion), separated by one blank line. Parameterize cases that share behavior. Assert meaningful user outcomes, persistence where relevant, and recovery; a successful HTTP status alone is not a UI result. Select representative browser validation rather than copying the full API matrix. For generated artifacts, verify their meaningful content where supported, not just element existence.

Run functional UI scenarios once at the configured desktop viewport. Keep responsive sampling in exploration; do not add a viewport matrix, screenshot baselines or arbitrary timing assertions. Clearly label mocked regression coverage and retain live primary-journey coverage.

## Verify and deliver

In this repository run only `npm run test:ui` for test verification (use its spec filters for focused investigation when needed). Resolve relevant failures and report unrelated failures accurately. Do not run API suites or refresh API coverage merely because UI fixtures call APIs; API test/contract changes invoke their separate workflow.

Deliver the implemented coverage, actual execution counts, cleanup status, bug links, local review index and unresolved or uninspected scope. Keep selected scenarios separate from executed results. Review the trial for workflow gaps and make narrow, evidence-supported skill improvements. Keep `.agents/skills/ui-testing` and `.claude/skills/ui-testing` synchronized and validate both.

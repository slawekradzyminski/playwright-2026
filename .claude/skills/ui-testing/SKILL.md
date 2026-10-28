---
name: ui-testing
description: Explore this project's UI, analyze the frontend and its backend integration, write or update Playwright UI and accessibility tests, and report UI findings. Use for UI exploration, automation, and UI bug reports; use api-testing for API exploration and backend defects.
---

# UI testing

Work from the repository root; resolve `references/` relative to this skill.
All other project paths are relative to the repository root.

For every task, first read the [shared testing rules](../shared/testing.md).
They define evidence/reporting, data ownership and cleanup, coverage-plan
maintenance, verification and skill synchronization.

- For exploration, read [exploration](references/exploration.md), including
  the agreed viewport targets and review aspects.
- For new or changed tests, explore the relevant behavior and read
  [automation](references/automation.md), including the automated viewport,
  Given–When–Then, setup, page objects and accessibility checks.
  For signed-in scenarios, follow its authenticated browser setup and per-test
  user ownership standard; reuse `tests/ui/fixtures.ts` and the API cleanup lifecycle.
- For findings, read [reporting](references/reporting.md), including when
  UI work reveals a backend defect.
- For Shop API (REST/GraphQL) scenarios, also read [GraphQL](references/graphql.md).

Explore the real UI before writing tests; use Playwright CLI when useful and
verify selectors and messages against the target application.

## Maintaining the UI test plan

Use `UI-TEST-PLAN.md` as the current screen coverage inventory and prioritized
backlog, following the shared coverage-plan rules. Read it when exploring,
planning or changing UI coverage. Include role/access expectations and update
the inventory when frontend routes or access rules change.

Count each routed screen pattern once; distinct create/edit routes count
separately, while redirect aliases, shared navigation, tabs/dialogs, MFA states,
viewport variants and REST/GraphQL modes remain scenarios. Count a screen only
when an active explicit Playwright UI test exercises and asserts functionality
of that screen itself. Homepage shortcut and header navigation checks cover
the source navigation only, not the destination screen, even when they assert
its title, list, identity fields or empty state. Mark navigation-only
destinations as gaps until direct functional tests exist. URL-only checks,
setup/cleanup, exploratory CLI checks, skipped tests, frontend unit tests and
standalone axe scans do not increase screen coverage.
Do not equate screen counts with workflow completeness, role/authorization
coverage, accessibility conformance or passing results. Track remaining depth
even for screens already counted as covered.

Include anonymous, client and admin access, including page-level admin checks
outside `/admin`. Verify authorized content and unauthorized direct navigation;
hidden links alone do not establish route or API authorization. Reconcile the
source inventory with the running app when available, keeping source-only
expectations distinct from observed behavior.

## White-box analysis and integration

Before exploring or automating a view, inspect the relevant frontend source in
[the React repository](https://github.com/slawekradzyminski/vite-react-frontend).
Record the repository revision and whether it matches the deployed build; use a
local checkout if available. Trace components, routes, validation, state and
error handling, shared UI components, accessibility, and existing tests. Review
React code for risks such as incorrect state/effect handling, unsafe rendering,
races, and error paths; turn evidence-backed risks into focused exploratory
charters. Keep source-only observations separate from runtime-confirmed behavior.

Trace the view's HTTP requests and responses through the frontend client and,
where relevant, the backend implementation and contract. Compare browser
network observations and user-visible outcomes with those expectations. Check
validation boundaries, authentication and authorization, loading, error and retry
paths when relevant. Sanitize evidence and use disposable data. Do not assume
that a UI symptom originates in the frontend or that every server error is a
backend defect; establish the responsible layer where possible.

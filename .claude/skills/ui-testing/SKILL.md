---
name: ui-testing
description: Explore this project's UI, analyze the frontend and its backend integration, write or update Playwright UI and accessibility tests, and report UI findings. Use for UI exploration, automation, and UI bug reports; use api-testing for API exploration and backend defects.
---

# UI testing

Work from the repository root; resolve `references/` relative to this skill.
All other project paths are relative to the repository root.

- For exploration, read [exploration](references/exploration.md), including
  the agreed viewport targets and review aspects.
- For new or changed tests, explore the relevant behavior and read
  [automation](references/automation.md), including the automated viewport,
  Given–When–Then, setup, page objects and accessibility checks.
  For signed-in scenarios, follow its authenticated browser setup and per-test
  user ownership standard; reuse `tests/ui/fixtures.ts` and the API cleanup lifecycle.
- For findings, read [reporting](references/reporting.md), including when
  UI work reveals a backend defect.

Explore the real UI before writing tests; use Playwright CLI when useful and
verify selectors and messages against the target application.

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

## Maintaining this skill

Edit the `.agents/skills/ui-testing/` copy, then run `npm run skills:sync`
and `npm run skills:check` to maintain the identical Claude Code copy.

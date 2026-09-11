---
name: ui-testing
description: Explore this project's UI, report reproducible visual, accessibility, functional, network, performance and UX findings, and write, review or simplify its Playwright UI tests. Use for UI exploration and regression automation; API-only work belongs to api-testing.
---

# UI Testing

Read the repository root `AGENTS.md` and applicable nested instructions first. They own shared test structure, selectors, page-object responsibilities and execution rules; do not duplicate them here. Repository paths below are relative to the repository root; reference links are relative to this skill.

Explicit user instructions take precedence over this skill's guidelines. Use the conversation to resolve routine choices and carry authorized work through to completion. Ask only when missing information materially prevents a sound next step; continue independent work meanwhile. If a skill instruction causes a pause or divergence, link the exact instruction and explain whether it is a requirement or your interpretation.

## Working approach

Explore as a tester trying to uncover consequential failures, not as an executor completing a fixed script. Choose experiments using the screen's purpose, your testing knowledge and what you observe. Change direction, combine states and follow anomalies within the user's scope. The references provide useful lenses and evidence standards, not a prescribed order or an exhaustive test catalog.

- Establish context from `pages/README.md`, relevant specs and `docs/bugs/ui/README.md`. Destination page objects alone do not establish automated coverage.
- Before adding or changing UI tests, use [exploration](references/exploration.md) and the global `playwright-cli` skill. Choose probes autonomously while preserving the evidence and cleanup requirements. If prerequisites are missing, state the blocker. Review-only work needs live reproduction only when necessary to establish a finding.
- For actionable findings, use [bug reporting](references/bug-reporting.md) and the [report template](references/bug-report-template.md). Assess impact before severity and preserve reproducible evidence.
- When implementing tests, read [automation](references/automation.md). Select a small set of business scenarios after exploration; do not let that suite-size preference constrain discovery.
- Finish code changes with [review and improvement](references/review-and-improvement.md). Keep coverage notes and execution claims tied to actual evidence.

Load only references needed for the task. Keep scratch evidence in ignored `exploration/ui/`; do not generate per-screen exploration reports or screenshot galleries. Creating this skill does not require exploring or expanding the test suite.

## Shared copies

The canonical skill is `.codex/skills/ui-testing`. Keep `.claude/skills/ui-testing` identical after edits, including references. Use ordinary files, as for the API skill. Both copies read the same repository instructions and bug records.

## Self-improvement

When actual use reveals missing or misleading guidance, make a focused correction in the relevant reference and synchronize both copies. Keep shared rules in `AGENTS.md`; do not append session histories or speculative requirements.

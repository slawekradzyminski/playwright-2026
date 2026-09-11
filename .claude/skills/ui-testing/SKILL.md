---
name: ui-testing
description: Explore this project's UI, report reproducible visual, accessibility, functional, network, performance and UX findings, and write, review or simplify its Playwright UI tests. Use for UI exploration and regression automation; API-only work belongs to api-testing.
---

# UI Testing

Read the repository root `AGENTS.md` and applicable nested instructions first. They own shared test structure, selectors, page-object responsibilities and execution rules; do not duplicate them here. Repository paths below are relative to the repository root; reference links are relative to this skill.

1. Read `pages/README.md`, relevant specs and `docs/bugs/ui/README.md` to establish current coverage, scope and known findings. Destination page objects alone do not mean those screens have automated coverage.
2. Before adding or changing UI tests, follow [exploration](references/exploration.md), using the global `playwright-cli` skill. Review screenshots at desktop, tablet and mobile sizes; automated paths remain desktop-only. If prerequisites are unavailable, record the blocker and do not claim exploration occurred. Review-only work needs live reproduction only when necessary to establish a finding.
3. Use [bug reporting](references/bug-reporting.md) and the [report template](references/bug-report-template.md) for actionable findings. Assess impact before severity; preserve essential evidence in repository reports.
4. Read [automation](references/automation.md) when implementing. Keep a small set of business end-to-end scenarios with focused page objects and composed components.
5. Finish code changes with [review and improvement](references/review-and-improvement.md). Update existing coverage notes and findings when affected; keep execution claims tied to actual runs.

Load only references needed for the task. Keep scratch evidence in ignored `exploration/ui/`; do not generate per-screen exploration reports or screenshot galleries. Creating this skill does not require exploring or expanding the test suite.

## Shared copies

The canonical skill is `.codex/skills/ui-testing`. Keep `.claude/skills/ui-testing` identical after edits, including references. Use ordinary files, as for the API skill. Both copies read the same repository instructions and bug records.

## Self-improvement

When actual use reveals missing or misleading guidance, make a focused correction in the relevant reference and synchronize both copies. Keep shared rules in `AGENTS.md`; do not append session histories or speculative requirements.

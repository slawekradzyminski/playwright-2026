---
name: api-testing
description: Explore this project's APIs, report reproducible functional and contract defects, and write, review, or simplify its Playwright API tests. Use for API exploration, regression automation, API test review, and coverage-plan maintenance.
---

# API Testing

Read the repository root `AGENTS.md` and any applicable nested instructions first. They own the shared coding and test rules; do not duplicate them here. All repository paths below are relative to the repository root; reference links are relative to this skill.

1. Read `docs/api-test-plan.md` and relevant entries in `docs/bugs/README.md` to identify current coverage, unresolved requirements, and known defects.
2. Before automating new scenarios, follow [exploration](references/exploration.md). Establish expected behavior and reproduce observations against the running build. If the stack or prerequisites are unavailable, record the blocker and do not claim exploration was performed.
3. For findings, use [bug reporting](references/bug-reporting.md) and the [report template](references/bug-report-template.md). Assess impact before severity; retain evidence in repository reports.
4. For implementation, read [automation](references/automation.md). For streaming endpoints, also read [streaming and controlled mocks](references/streaming.md). Keep tests short, with business-readable intent and technical mechanics in focused supporting files.
5. Finish implementation with [review and improvement](references/review-and-improvement.md): review correctness, simplify the code, and verify the final version.
6. When coverage, execution evidence, or priorities change, apply [plan maintenance](references/test-plan.md). Keep the plan a short current snapshot.

Load only references needed for the task. A review-only request does not require fresh live exploration unless a finding needs reproduction. Keep work within the requested scope.

## Shared copies

The canonical skill is `.codex/skills/api-testing`. Keep `.claude/skills/api-testing` identical after edits, including references. Both copies read the same repository `AGENTS.md`, test plan, and bug records. Use ordinary files so team checkouts do not depend on symlink support.

## Self-improvement

This skill is a living reference. When actual use reveals missing or misleading guidance, fix them and improve the skill.

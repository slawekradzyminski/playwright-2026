---
name: api-testing
description: Explore this project's REST API with backend source analysis and curl, write or update Playwright API tests, and document confirmed API bugs. Use for endpoint testing, API coverage, regressions, and API bug reports; exclude UI-only testing and unrelated backend implementation.
---

# API testing

Deliver runtime evidence, a lean independent test suite when requested, and
root-cause bug reports. Work from the repository root; resolve `references/`
relative to this skill directory. All other project paths below are relative
to the repository root.

## Choose the requested work

- **Explore an endpoint:** read [exploration](references/exploration.md).
- **Add API tests:** complete exploration first, then read
  [automation](references/automation.md). Exploration determines what deserves
  automation; it does not require automating every probe. Update `API-TEST-PLAN.md`
  whenever added or removed tests change explicit endpoint coverage, using the
  counting rules below. Keep this file generic: update the current coverage
  counts, covered endpoints, remaining gaps, priorities and inventory basis only.
  Do not add increment histories, run dates, test totals/results, environment
  snapshots, findings, cleanup details or links to individual increment reports.
  Put task-specific evidence in a separate evidence document and the final response.
- **Change existing API tests:** read automation and re-explore behavior affected
  by the change. Update `API-TEST-PLAN.md` when the change adds or removes
  explicit endpoint coverage. Reuse recorded evidence only if the endpoint,
  backend revision, profile, configuration, and contract are unchanged and
  documented.
- **Report findings:** read [reporting](references/reporting.md), including when
  exploration uncovers a bug during another API task.
- **Measure coverage or plan work:** update `API-TEST-PLAN.md` concisely. Count
  method + route against an identified backend inventory; count only endpoints
  with explicit tests, list gaps and priorities, and identify the inventory basis.
  Keep the plan a current generic coverage inventory, not an activity log.
  Put profile, runtime, verification limits and run-specific evidence in a
  separate document or the final response. Do not equate endpoint counts with
  scenario coverage or passing tests. Reconcile with the live contract when available.

For combined requests, follow source analysis → curl exploration → finding
triage → representative automation → verification. An exploration-only request
does not authorize adding a test suite or fixing the backend.

## Project context

- Backend reference: `https://github.com/slawekradzyminski/test-secure-backend`.
  Clone it into the session scratchpad (or a temporary directory when none is
  provided). Treat it as read-only; record its full commit SHA. Do not assume
  its current HEAD matches the running application.
- Target the gateway from `APP_BASE_URL`, following `test-config.ts` and
  `playwright.config.ts`; the local default is `http://localhost:8081`.
  Read `README.md` and `.env.example` for setup. Keep credentials and tokens
  out of tracked files and sanitized evidence.
- After source analysis, fetch the live contract with curl from
  `http://localhost:8081/v3/api-docs` for the local default, or
  `${APP_BASE_URL}/v3/api-docs` for the configured gateway. Do not target internal
  service ports or silently switch environments when the gateway is unavailable.
- Read the relevant existing clients in `http/`, DTOs in `types/`, generators in
  `generators/`, and nearby endpoint specs in `tests/api/` before extending them.

## Evidence and completion

Distinguish runtime-confirmed defects, code-only suspicions, contract mismatches,
and unresolved product/environment decisions. Never invent a response, backend
revision, active profile, or passing test result. If a dependency is unavailable,
complete independent work and state the exact unverified remainder.

Finish with the endpoint scope, observed revision/profile (or uncertainty),
findings and report paths, tests added or deliberately omitted, verification
commands/results, and cleanup status. Keep this proportional to the task.

## Maintaining this skill

The `.agents/skills/api-testing/` copy is the editing source;
`.claude/skills/api-testing/` is an identical real copy for Claude Code.
After edits run `npm run skills:sync`, then `npm run skills:check`.
Use shared `name` and `description` frontmatter and portable shell/project tools;
keep instructions independent of model names, versions, and host-specific APIs.

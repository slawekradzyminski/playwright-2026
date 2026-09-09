---
name: api-testing
description: Design, explore, and create or extend HTTP API tests using backend and unit-test assessment to keep integration coverage focused. Use for API test planning, exploratory testing, and API test implementation; not for UI testing or a standalone backend audit.
---

# API Testing

Build a small, justified API suite from observed behavior and evidence about lower-level coverage. Treat suspicious results seriously and report them immediately, including documentation mismatches.

## Scope and execution

Apply the assessment/exploration/automation sequence to API testing tasks. An edit confined to instructions or prose needs document and skill validation; it does not itself require live requests or test implementation. Changes to API contracts or test behavior still require the full applicable workflow.

Use repository evidence to resolve routine choices without an approval pause. Follow explicit user instructions over skill guidelines, within higher-priority constraints. When a rule prevents requested work, link this file or the relevant reference, quote the rule, and identify the specific blocked scope. Continue eligible endpoints and independent work.

Keep task corrections and completed evidence aligned: if the endpoint, identity or environment changes, reassess which exploration results remain applicable before reusing them. Delegate only with authorization; separate disposable resources and cleanup ownership when work runs in parallel.

## Workflow

Read applicable `AGENTS.md`, `CLAUDE.md`, project procedures, API contracts, existing reports, clients, and fixtures. Use the project's selected framework and environment; this skill does not require a particular agent tool or connector. Write tests and reports in English unless the user instructs otherwise. Read the maintained API test plan and coverage inventory, when present, before selecting work. Use their priorities and dependencies when the user leaves the next scope open; an explicit user request takes precedence. The maintained backlog does not replace the endpoint assessment and pre-request exploration plan.

1. **Assess before designing cases.** Read [assessment.md](references/assessment.md). Inspect the affected backend implementation and actual unit/integration test assertions; record source/deployed revision alignment and coverage gaps. Prefer lower-level coverage for validation permutations. Justify each proposed API case by a distinct integration risk.
2. **Plan, then explore from the terminal.** Read [exploration.md](references/exploration.md). Save the plan before requests, then use curl, HTTPie, wget, or another terminal HTTP client. Contract review, backend inspection, and running the automated suite do not replace current exploratory execution.
3. **Report findings as they arise in any phase.** On a suspicious result, read [bugs.md](references/bugs.md), immediately create/update a local report, and notify the user. Write the impact rationale before selecting severity, as specified in that reference. Do not defer reporting until the end. Delete confirmed false-positive reports and their references as described in [bugs.md](references/bugs.md). This does not authorize publishing issues or sending messages to others.
4. **Automate only explored, verified behavior.** Read [automation.md](references/automation.md) when ready to implement. Select the appropriate admin/customer fixtures for the tested request. Keep functional defects out of passing automation; do not mark expected failures, hide gaps with skips, or assert defective behavior. Documentation-only bugs do not block tests of verified, intended runtime behavior: retain those tests and add a comment above each affected test or parameterized group linking the report (see [bugs.md](references/bugs.md)).
5. **Verify and hand over.** Run affected specs, then the relevant API suite. Report assessment and exploration evidence, coverage decisions, execution results, bug links, and unresolved gaps or cleanup. After a fix, explore the corrected behavior before adding passing regression coverage. Update the maintained plan and coverage records for the affected scope, including remaining gaps, blockers and the next action; keep implemented coverage separate from execution results, including failed or blocked runs.

For the `playwright-2026` course repository only, read [project-profile.md](references/project-profile.md) for backend discovery, fixture names, commands, and the maintained plan/coverage workflow. In other projects discover equivalents; do not apply course URLs or fixture paths automatically.

## Boundaries and completion

Requirements and contracts define expectations; implementation explains risks and does not define correctness. Label undocumented expectations as hypotheses. Missing backend access or revision evidence makes coverage decisions provisional; missing runtime access blocks automation of that scope. Continue unaffected work and report limitations without inventing execution evidence.

Use unique disposable resources, clean up only owned data, and preserve sanitized request/response evidence. Record cleanup failures. Backend test changes must be within the requested scope; otherwise propose concrete lower-level cases and hand them over. Do not expand a test request into production-code fixes or unrelated audits.

For planning-only requests, deliver the assessment and plan without proceeding to mutations or automation outside the request. For implementation requests, complete the ordered workflow through verification or an evidenced blocker.

After each run, briefly review whether the workflow missed a risk or caused unnecessary tests. Make narrow, evidence-supported improvements to the relevant project procedure or skill where authorized; do not turn one observation into a universal rule. If updating this installed skill, keep the Codex and Claude copies synchronized and validate them.

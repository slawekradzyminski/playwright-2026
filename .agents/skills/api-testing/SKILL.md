---
name: api-testing
description: Design, explore, and create or extend HTTP API tests using backend and unit-test assessment to keep integration coverage focused. Use for API test planning, exploratory testing, and API test implementation; not for UI testing or a standalone backend audit.
---

# API Testing

Build a small, justified API suite from observed behavior and evidence about lower-level coverage. Treat suspicious results seriously and report them immediately, including documentation mismatches.

## Workflow

Read applicable `AGENTS.md`, `CLAUDE.md`, project procedures, API contracts, existing reports, clients, and fixtures. Use the project's selected framework and environment; this skill does not require a particular agent tool or connector. Write tests and reports in English unless the user instructs otherwise.

1. **Assess before designing cases.** Read [assessment.md](references/assessment.md). Inspect the affected backend implementation and actual unit/integration test assertions; record source/deployed revision alignment and coverage gaps. Prefer lower-level coverage for validation permutations. Justify each proposed API case by a distinct integration risk.
2. **Plan, then explore from the terminal.** Read [exploration.md](references/exploration.md). Save the plan before requests, then use curl, HTTPie, wget, or another terminal HTTP client. Contract review, backend inspection, and running the automated suite do not replace current exploratory execution.
3. **Report findings as they arise in any phase.** On a suspicious result, read [bugs.md](references/bugs.md), immediately create/update a local report, and notify the user. Do not defer reporting until the end. This does not authorize publishing issues or sending messages to others.
4. **Automate only explored, verified behavior.** Read [automation.md](references/automation.md) when ready to implement. Select the appropriate admin/customer fixtures for the tested request. Keep known open bug scenarios out of automation; do not mark expected failures, hide gaps with skips, or assert defective behavior.
5. **Verify and hand over.** Run affected specs, then the relevant API suite. Report assessment and exploration evidence, coverage decisions, execution results, bug links, and unresolved gaps or cleanup. After a fix, explore the corrected behavior before adding passing regression coverage.

For the `playwright-2026` course repository only, read [project-profile.md](references/project-profile.md) for backend discovery, fixture names, and commands. In other projects discover equivalents; do not apply course URLs or fixture paths automatically.

## Boundaries and completion

Requirements and contracts define expectations; implementation explains risks and does not define correctness. Label undocumented expectations as hypotheses. Missing backend access or revision evidence makes coverage decisions provisional; missing runtime access blocks automation of that scope. Continue unaffected work and report limitations without inventing execution evidence.

Use unique disposable resources, clean up only owned data, and preserve sanitized request/response evidence. Record cleanup failures. Backend test changes must be within the requested scope; otherwise propose concrete lower-level cases and hand them over. Do not expand a test request into production-code fixes or unrelated audits.

For planning-only requests, deliver the assessment and plan without proceeding to mutations or automation outside the request. For implementation requests, complete the ordered workflow through verification or an evidenced blocker.

After each run, briefly review whether the workflow missed a risk or caused unnecessary tests. Make narrow, evidence-supported improvements to the relevant project procedure or skill where authorized; do not turn one observation into a universal rule. If updating this installed skill, keep the Codex and Claude copies synchronized and validate them.

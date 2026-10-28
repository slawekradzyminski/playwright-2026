# Shared project testing rules

Read this reference for every API or UI testing task, together with the relevant
skill's workflow. Paths below are relative to the repository root.

## Exploration evidence and reports

Do not create standalone exploration/session reports, evidence documents or
increment summaries in `docs/` or elsewhere unless the user explicitly requests
such a document. This applies to exploration performed before or during test
implementation as well as exploration-only tasks. Put scenarios, observations,
environment/revision details, verification results, limitations and cleanup
status in the final response. Record confirmed defects and product/policy
questions in the designated bug reports and questions files, following the
skill's reporting reference; attach sanitized reproduction artifacts when useful.
Temporary scratchpad data for performing checks is allowed; it does not require
a standalone report or committed evidence document.

Distinguish runtime-confirmed defects, code-only suspicions, contract mismatches,
and unresolved product/environment decisions. Do not treat an undocumented
preference as a defect or automated assertion; do not invent responses,
revisions, profiles or passing results. State uncertainty when source and running build cannot be matched.
If a dependency is unavailable, complete independent work and state the exact
unverified remainder. An exploration-only request does not authorize adding a
test suite or fixing the application.

Search existing bug reports across areas before adding one. Preserve shared
`BUG-NNNN` numbering, allocating the next available number for a new report,
and consolidate symptoms when evidence supports a shared root cause and fix.
Follow `bugs/README.md`, `bugs/TEMPLATE.md` and the skill's
reporting reference for destinations and reproduction details. A local report
does not authorize an external issue or message.

## Test data and credentials

Use disposable data and track owned resources before assertions that could
fail, including unexpectedly successful negative requests. Arrange cleanup
before mutations; use fixture teardown/finally in automation so cleanup runs
after assertion or setup failures.
Respect resource dependencies, verify cleanup responses, and report remaining
owned resources or cleanup failures. Do not mutate/delete pre-existing shared
resources or change protection settings to make checks pass.

Keep tests independent of test order and data left by other tests. Keep
authentication test-scoped and use the configured administrator only for
operations requiring it. Keep credentials, tokens and real personal data out
of tracked files and evidence; use sanitized reproduction artifacts.

## Current coverage plans

Read and update the relevant test plan when explicit coverage or the source
inventory changes. Update counts, covered items, remaining gaps, priorities and
the revision/inventory basis together. Keep plans as current coverage
inventories, without increment histories, run dates, test totals/results,
environment snapshots, findings, cleanup logs or links to session reports.
Put run-specific evidence in the final response and relevant bug reports.
Apply the skill's counting rules; inventory coverage does not prove scenario
completeness or passing results. Track remaining depth for covered items too.

## Automation and verification

Automate representative, valuable behavior rather than every exploratory probe.
Do not assert a known defect as correct behavior or add known-failing, skipped
or expected-failure reproductions. Keep reproduction evidence in bug reports
and require the regression in the fix's acceptance criteria.

Run checks appropriate to the change and investigate failures. Repair test
problems within scope; do not weaken assertions or add retries to hide application
defects. Reuse passing evidence for unchanged artifacts; broaden verification
when shared behavior changes or unresolved concerns justify it. Report actual
commands/results and blocked checks; a type or collection check is not a runtime
pass. Check the final diff for secrets, debug artifacts and unrelated edits.

## Maintaining the skills

Edit `.agents/skills/`, including this shared reference; `.claude/skills/` holds
identical real copies for Claude Code. Run `npm run skills:sync`, then
`npm run skills:check`. Keep portable shell/project tools and shared Agent Skills
frontmatter; avoid model/version or host-specific dependencies.

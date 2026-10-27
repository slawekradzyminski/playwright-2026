# Findings and bug reports

Read `bugs/README.md`, `bugs/TEMPLATE.md`, `bugs/ui/QUESTIONS.md`, and relevant
existing reports before writing. Use English throughout.

## Classify and consolidate findings

Report confirmed frontend/UI defects in `bugs/ui/` using the shared template.
Label each report `functional`, `accessibility`, `usability` and/or `visual`
as appropriate. Record subjective concerns or behavior requiring product or
design agreement in `bugs/ui/QUESTIONS.md`. Keep source-only suspicions separate
from runtime-confirmed behavior; never present a static suspicion as a confirmed
bug. Investigate repetitions and establish the responsible layer where possible.

Do not ignore backend defects discovered during UI work: use the project-local
[api-testing skill](../../api-testing/SKILL.md) for API exploration, backend
bug reports and API tests, and report backend findings under `bugs/api/`. Link
related reports rather than duplicating a root cause. Search existing reports
across areas and preserve shared `BUG-NNNN` numbering; group symptoms only when
evidence supports a shared cause and fix.

## Evidence and reproduction

Provide minimal reproduction steps, expected and actual behavior, the basis
for the expectation, and user impact. Record the date, environment, browser
and viewport when relevant, source revision, and runtime build or explicit
uncertainty. Distinguish observed behavior from suspected causes and support
claims with sanitized evidence. Never include secrets or real personal data.

Screenshots are recommended when they help demonstrate a visible UI or
usability issue; for other issues choose the most informative evidence, such
as DOM inspection, a trace or logs. Save screenshots in `bugs/ui/screenshots/`
with the bug ID in the filename, sanitize them and explain what they show.
A local report does not create or authorize an external issue or message.

# Report API bugs

Read existing reports in `docs/bugs/` before creating a finding; extend an existing finding when the evidence describes the same problem.

## Classify findings

Assess and present impact before assigning severity. In reports and conversational findings, use this order:

1. Describe the observed failure and the expected behavior, with evidence.
2. Explain who is affected, which workflow is affected, how far the impact extends, and whether a practical workaround exists. Distinguish demonstrated consequences from plausible but unverified ones; state missing context.
3. Write a concise impact assessment, then select H, M or L using the criteria below. If evidence is insufficient, mark the assessment provisional and identify what would settle it.

Do not begin a finding with a severity label and then write a justification for that label. A schema mismatch or unexpected status code alone does not establish the scale of user impact. Examples below illustrate possible classifications; they are not automatic mappings from bug type to severity.

Start new report headings with **`[category] Endpoint — observable problem`**, without severity. Place the severity decision after the impact assessment. Once that assessment is complete, retain **`[severity][category] ID - Short description.md`** filenames for indexing. Register entries must present impact before a separate severity column; put severity totals after the assessments. Existing reports may retain their historical headings; apply the new presentation order when reassessing them.

| Severity | Meaning | Example |
|---|---|---|
| `[H]` High | Core workflow blocked, authentication bypass, privilege escalation, sensitive data exposure, or similarly serious demonstrated impact | Client receives usable admin privileges |
| `[M]` Medium | Materially incorrect behavior or contract that disrupts error handling, integrations, or meaningful automated checks; core happy path remains usable | Malformed JSON returns 401; normal response contradicts its schema |
| `[L]` Low | Limited impact on clarity or usability without changing the core outcome | Overlong input shows a minimum-length message |

| Category | Use for |
|---|---|
| `[FA]` Functional API | Incorrect runtime behavior, validation, authorization, or HTTP handling |
| `[D]` Documentation | Incorrect/incomplete Swagger contract, schema, example, or description |

Examples: `[M][FA] POST /users/signin — malformed JSON returns 401`; `[M][D] POST /users/signin — 422 uses the success schema`; `[L][FA] POST /users/signin — maximum-length error mentions minimum`.

Severity measures impact, not how soon the team schedules a fix. Explain the impact in each report; do not promote an unverified security suspicion to a confirmed High defect. Use **Needs clarification** when expected behavior is unresolved, **Open** for an actionable observed finding, **Fixed, awaiting retest** after a change, and **Verified** only after retesting the identified build. Keep stable IDs when severity or status changes. Allocate the next unused BUG-NN or DOC-NN from the current register; do not reuse IDs.

## How to maintain the register

1. Copy the [bug-report template](bug-report-template.md) into `docs/bugs/`. Use the next unused `BUG-NN` for FA or `DOC-NN` for D; keep the ID stable. Name the file `[severity][category] ID - Short description.md`, for example `[L][FA] BUG-01 - Sign-in request errors return 401.md`. Keep filename prefixes aligned with severity/category changes and update links when renaming.
2. Start new report headings with `[FA/D]`, followed by the method, path, and observable problem. Present evidence and an impact assessment before assigning severity, following the [classification guide](#classify-findings). Add severity prefixes to filenames and register entries only after completing the assessment. When reassessing an existing report, move its severity decision below its impact assessment.
3. Add the report to the register table with observed impact before the separate severity and status columns. Update its status here and in the report together; keep the counts current.
4. Record fixes as **Fixed, awaiting retest**. Use **Verified** only after recording the retest date, build, and evidence. Keep closed reports for history.

The individual reports are the authoritative place for status and retest updates. Keep reproduction evidence in each bug report; separate per-endpoint exploration reports are not maintained. These are repository records; no GitHub issues have been published.


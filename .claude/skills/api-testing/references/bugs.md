# Immediate bug reporting

As soon as something suspicious appears, create or update a report in `reports/bugs` and tell the person requesting the work; do not wait until automation or the end of the task. Start with status `Suspected` if evidence is incomplete. Check for duplicates and reproduce with a minimal request, verifying the actual HTTP method, URL, authentication and serialized payload. A failed reproduction alone does not disprove a finding.

When corrected exploration confirms that a report was a false positive caused by a probe, setup or interpretation error, delete the bug file and remove its index entries, links, test comments and plan blockers. Do not retain a closed or “Not reproduced” report for a confirmed false positive. Keep the corrected verified behavior in the exploration evidence; retain genuinely unresolved findings as `Suspected`.

Use the project bug template when present; otherwise use the structure below. Distinguish functional behavior from documentation/contract mismatches using the `Type` field. Keep stable `BUG-NNN` IDs. Follow the project naming guide and update all references whenever a filename changes. One report per independently actionable issue; link related issues.

Before choosing severity, write a `Severity rationale` section immediately after the title, before classification. Explain the affected journey/users, observed consequence, scope, persistence, viable recovery and evidence limits without naming the level. Only then select severity using the project impact guide. Do not retrofit a rationale to an initial label or treat an HTTP status, category, speculative outage or reproduction confidence as severity. Compare analogous reports for consistency and preserve explicit user decisions. In a reassessment update report fields, filenames, index and references together without implying fresh reproduction.

State the expected behavior and its source separately from the actual result. If a requirement is ambiguous, record the observed behavior and the question to resolve. Do not downgrade an issue merely because it concerns documentation or an error message: describe its concrete impact and propose severity with a rationale. Do not claim a fix or a fresh reproduction without evidence.

Do not assert a known functional defect as correct behavior, mark it as an expected failure, or hide it with a skip. Link excluded functional scenarios to their reports; add passing regression coverage after a fix and exploratory verification.

A documentation-only mismatch does not block automation of correct, explored runtime behavior. Keep tests for supported success and error responses even when OpenAPI has the wrong schema, media type, or an omitted status. Add a short comment immediately above the affected test or parameterized group naming the documentation bug and linking its report. Assert the verified intended status, body, headers and state; do not assert the incorrect documentation. The bug classification alone is not proof that runtime behavior is correct: establish that from requirements, user clarification and exploration. Record genuinely unresolved expectations instead of treating arbitrary observed behavior as correct.

## Classification and report structure

In playwright-2026, follow [the bug classification guide](../../../../reports/bugs/README.md): `[S][T]-BUG-NNN-short-description.md`, allocating the next unused number across categories. Preserve IDs during reclassification; rename and update links/index together. In other projects follow the local naming convention. Use one report per independently actionable issue and link related findings rather than duplicating a mismatch.

- **Functional:** incorrect behavior, validation, permissions, persistence, or misleading user-facing errors.
- **Documentation/contract:** a discrepancy involving a schema or documentation. This identifies the mismatch; triage determines whether code or documentation must change.

Include these fields/sections in every report:

1. Title with stable ID and specific observed problem.
2. Severity rationale first, then classification: primary category, tags, type, status (`Suspected`, `Open`, `Fixed (awaiting verification)`, `Closed`, or `Not reproduced`), and proposed severity selected from the preceding rationale.
3. Endpoint: HTTP method and path.
4. Environment: observation date/time, gateway, application version/revision, contract source/version, and identity without credentials.
5. Preconditions: required state and disposable setup data.
6. Reproduction: exact method/path, headers with credential placeholders, payload, and follow-up reads where relevant.
7. Expected: status, body, and state with the requirement/contract source; label assumptions and proposed wording.
8. Actual: observed status, headers where relevant, body including empty bodies, and state changes.
9. Evidence: sanitized request/response links, exploration case IDs, and reproduction frequency. State missing evidence explicitly.
10. Impact: affected users/consumers and practical consequences.
11. Cleanup: resources created, deletion outcome, and unresolved leftovers.
12. Follow-up and automation: requirement questions, related findings, excluded cases, and fix-verification evidence when available.

A coverage gap alone is not a confirmed product bug. Track concrete lower-level test recommendations in the assessment; record suspected implementation defects here. Reformatting a historical report is not fresh reproduction and must preserve that distinction.

# Immediate bug reporting

As soon as something suspicious appears, create or update a report in `reports/bugs` and tell the person requesting the work; do not wait until automation or the end of the task. Start with status `Suspected` if evidence is incomplete. Check for duplicates, reproduce with a minimal request when feasible, and preserve the original observation. A failed attempt to reproduce is information, not a reason to discard a finding.

Use the project bug template when present; otherwise use the structure below. Distinguish functional behavior from documentation/contract mismatches using the `Type` field. Keep stable `BUG-NNN` IDs and filenames so existing links survive. One report per independently actionable issue; link related issues.

State the expected behavior and its source separately from the actual result. If a requirement is ambiguous, record the observed behavior and the question to resolve. Do not downgrade an issue merely because it concerns documentation or an error message: describe its concrete impact and propose severity with a rationale. Do not claim a fix or a fresh reproduction without evidence.

Do not add automated tests that reproduce known open bugs, mark them as expected failures, skip them to disguise the gap, or assert incorrect behavior just to get a passing suite. Link the excluded scenarios to their reports. After a fix and exploratory verification, ordinary passing regression coverage can be added.

## Classification and report structure

Use `BUG-NNN-short-description.md` under `reports/bugs`, allocating the next unused number across types. Preserve existing identifiers and filenames during reclassification. Use one report per independently actionable issue and link related findings rather than duplicating a mismatch.

- **Functional:** incorrect behavior, validation, permissions, persistence, or misleading user-facing errors.
- **Documentation/contract:** a discrepancy involving a schema or documentation. This identifies the mismatch; triage determines whether code or documentation must change.

Include these fields/sections in every report:

1. Title with stable ID and specific observed problem.
2. Classification: type, status (`Suspected`, `Open`, `Fixed (awaiting verification)`, `Closed`, or `Not reproduced`), and proposed severity with impact rationale.
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

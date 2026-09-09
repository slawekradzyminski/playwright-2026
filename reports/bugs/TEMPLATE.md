# BUG-NNN: <specific observed problem>

Filename: `[S][T]-BUG-NNN-short-description.md`; follow [the classification guide](README.md).

## Severity rationale

<Before selecting a level: describe affected users/journey, observed consequence, scope/trigger, persistence and recovery. Distinguish untested consequences and missing evidence. Explain the practical impact without naming a severity.>

## Classification

- Type: Functional | Documentation/contract
- Category: accessibility | performance | ui | ux | functional | contract
- Tags: <primary category, optional additional categories, api/ui surface>
- Status: Suspected | Open | Fixed (awaiting verification) | Closed | Not reproduced
- Severity (proposed): <Critical/High/Medium/Low — select only after the rationale above>

## Endpoint

`METHOD /path`

## Environment

- Observed on: <date/time>
- Base URL: <gateway>
- Application version: <version or not recorded>
- Contract source/version: <URL, file and schema/operation>
- Identity: <admin, customer, anonymous; no credentials>

## Preconditions

<Required state, disposable data, and setup requests.>

## Reproduction

1. <Exact request method/path, headers with token placeholders, and payload.>
2. <Follow-up request proving the result, where relevant.>

## Expected

<Status, body and state; cite the contract or requirement. Label assumptions and proposed wording explicitly.>

## Actual

<Observed status, body, and state, including empty responses.>

## Evidence

<Relative links to sanitized requests/responses and exploration scenario IDs. State missing evidence and reproduction frequency honestly.>

## Impact

<Who is affected and how.>

## Cleanup

<Resources created and cleanup outcome, or not recorded.>

## Follow-up and automation

<Open questions, related bugs, fix verification evidence when available. Exclude known open bug scenarios from automated tests; do not mark expected failures.>

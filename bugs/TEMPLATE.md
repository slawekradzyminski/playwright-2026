# BUG-NNNN: Short title naming the root cause, not a single symptom

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Area] Root cause in one line |
| Issue Type | Bug |
| Priority | To be determined: Highest / High / Medium / Low / Lowest |
| Component/s | Application area |
| Labels | api, registration (adjust as needed) |
| Environment | URL, application version/build and other relevant conditions |
| Backend revision | Repository commit the root-cause analysis is based on |
| Verification date | YYYY-MM-DD |
| Report status | New / Needs confirmation / Reported / Fixed |
| Jira | Issue link once created |

## Description

What fails, and how does it affect users or data? Name the shared root cause
if several symptoms are covered.

## Symptoms

One row per observed, runtime-confirmed effect of the root cause.

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Minimal request | Correct behavior | Observed status and body |

## Root cause

Where and why the code behaves this way, with links to the exact lines at the
backend revision above. Mark anything not confirmed in code as suspected.

## Steps to reproduce

1. Use test data or placeholders.
2. Reference the symptom rows instead of repeating every variant.

## Evidence

Minimal request and sanitized response, log or attachment path.
State the reproduction frequency if verified. Only report results of attempts
that were actually performed.

## Suggested fix

Optional. Fix the root cause in one place rather than each symptom.

## Acceptance criteria

- Specific, verifiable behavior after the fix, covering every symptom row.
- A relevant regression scenario that must continue to work.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).

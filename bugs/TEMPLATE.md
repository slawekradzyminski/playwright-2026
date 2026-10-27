# BUG-NNNN: Short description of the problem

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Area] What fails |
| Issue Type | Bug |
| Priority | To be determined: Highest / High / Medium / Low / Lowest |
| Component/s | Application area |
| Labels | api or ui; for UI add functional, accessibility, usability and/or visual, plus relevant area |
| Environment | URL, application version/build, and relevant conditions |
| Browser / viewport | For UI findings when relevant; otherwise N/A |
| Source revision | Revision used for analysis, if known |
| Verification date | YYYY-MM-DD |
| Report status | New / Needs confirmation / Reported / Fixed |
| Jira | Issue link once created |

## Description

What fails, and how does it affect users or data? Explain the expected behavior
and its basis. Group related symptoms only when a shared cause is supported.

## Steps to reproduce

1. State any necessary setup using test data or placeholders.
2. Describe the smallest sequence of actions or requests that reproduces the issue.

## Expected result

Describe the behavior and its basis, such as a requirement or documented contract.

## Actual result

Describe the observed behavior. Use a symptom table if several related cases
share a confirmed cause.

## Evidence

Include evidence appropriate to the finding. Screenshots are recommended for
visible UI or usability issues when they help demonstrate the problem; use
`ui/screenshots/` and include the bug ID in the filename. For other issues use
judgment and choose evidence such as DOM inspection, traces or logs; a screenshot
is optional. Sanitize evidence and explain what it shows. State the reproduction
frequency only if verified. Distinguish runtime observations from source-only
findings.

## Root cause

If established, explain the cause and link to exact source lines at a fixed
revision. Mark an unconfirmed explanation as suspected, or state that the cause
is unknown.

## Suggested fix

Optional; propose a fix only when supported by the evidence.

## Acceptance criteria

- Specific, verifiable behavior covering the reported symptoms.
- A relevant regression scenario, automated at an appropriate level where useful.

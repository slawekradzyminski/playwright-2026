# Findings and bug reports

Read `bugs/README.md`, `bugs/TEMPLATE.md`, `bugs/QUESTIONS.md`, and relevant
existing reports before writing. Use English throughout.

## Classify the evidence

| Finding | Destination |
| --- | --- |
| Runtime-confirmed wrong application behavior | `bugs/functional/` |
| Runtime-confirmed contract/documentation mismatch | `bugs/documentation/` |
| Business rule, policy, or environment choice needing a decision | `bugs/QUESTIONS.md` |
| Static suspicion without runtime confirmation | Explicitly labeled code-only finding in the task evidence/final response; not a confirmed bug report |

Attempt a runtime check for every code suspicion. State why any check remains
unverified. Do not turn an undocumented preference into a bug or an automated
assertion. For a question, record the observed behavior, evidence level, decision
needed, decision owner if known, and what it blocks.

## Consolidate by root cause

Log every confirmed bug using `bugs/TEMPLATE.md`. Search all report folders for
the root cause and the highest `BUG-NNNN` number. Numbers are shared across
folders; allocate the next available number only when a new report is needed.

One root cause and shared fix means one report. Add symptom rows to an existing
report when the same fix addresses them; prefer a few actionable reports over
one file per validation variant. Follow `bugs/README.md` for cross-linking a
documentation mismatch that accompanies a functional defect.

Find the cause in backend code and link exact lines at the full fixed commit:
`https://github.com/slawekradzyminski/test-secure-backend/blob/<full-sha>/<path>#Lx-Ly`.
Do not link a moving branch. Distinguish the reference revision from the running
revision; mark a root cause as suspected if the runtime/source mapping or cause
has not been established. Never invent a code explanation to fill the template.

## Make the report reproducible

Include the environment, build/revision/profile or explicit uncertainty, date,
minimal setup, sanitized request and actual response, expected behavior and its
basis, symptom table, and user/data impact. State reproduction frequency only
for attempts performed. Keep passwords, Bearer tokens, and real personal data
out of evidence; use placeholders and disposable test data.

Suggest a fix at the shared cause where supported. Acceptance criteria must
cover the symptoms and require an automated regression test as part of the fix
(unit or API level as appropriate). Do not add a known-failing regression to the
current API suite. Creating a local report does not create or authorize a Jira
issue or any other external message.

# Bug reports

Write all reports in English. Use [TEMPLATE.md](TEMPLATE.md) for both API and UI findings.

| Location | Contents |
| --- | --- |
| `api/functional/` | API behavior, including data, security and business rules |
| `api/documentation/` | API contract and documentation mismatches |
| `api/QUESTIONS.md` | API findings awaiting a product or project decision |
| `ui/` | UI findings and product questions |
| `ui/screenshots/` | Screenshots attached to UI bug reports |

`BUG-NNNN` numbers are shared across all areas. Search existing reports and
choose the next available number; retain it if the report is transferred to Jira.
Group symptoms when evidence supports a shared root cause and fix. Link related
API and UI findings rather than reporting the same cause twice. If the cause is
unknown, describe observed behavior without guessing.

Include minimal reproduction steps, expected and actual behavior, and sanitized
evidence with the date and environment. Record browser and viewport for UI
issues when relevant; distinguish runtime observations from code-only analysis.
Never include real passwords, tokens or personal data.

Screenshots are recommended when they help demonstrate a visible UI, visual or
usability issue. For other issues, choose evidence suited to the behavior, such
as a DOM inspection, trace, logs or a screenshot when useful. Save screenshots
in `ui/screenshots/` using the bug ID in the filename; sanitize them and explain
what they show. Evidence must support the reported claim.

## UI categories

Keep UI reports in `ui/` and add one or more labels: `functional` (behavior or
integration), `accessibility` (barriers for people using assistive technology or
alternative input), `usability` (difficulty completing or understanding a task),
and `visual` (layout, rendering, readability or design inconsistency). A single
issue can have multiple labels; group by evidence and root cause, not by label.
Use `QUESTIONS.md` for subjective concerns or behavior awaiting product/design
agreement. Describe the user impact and the requirement, design reference or
other basis for the expected behavior.

## Jira

Copy the metadata into the corresponding fields of a **Bug** issue and paste
the sections from **Description** onward into its **Description** field.
Adjust priority and component names to the Jira project. Add the issue link to
the report after creation; a local file does not create a Jira issue.

## Renumbering on 2026-10-26

No report had been transferred to Jira yet. The 14 symptom-level reports were
consolidated into root-cause reports:

| Previous | Now |
| --- | --- |
| BUG-0001 whitespace-only names | BUG-0003 |
| BUG-0002 fractional cart quantity | BUG-0005 |
| BUG-0003 malformed body error format | BUG-0006 (functional), BUG-0008 (documentation) |
| BUG-0004 stale cart price | BUG-0002 |
| BUG-0005 empty email | BUG-0003 |
| BUG-0006 case-variant duplicates | BUG-0001 |
| BUG-0007 username whitespace/control characters | BUG-0001 |
| BUG-0008 "Minimum" message for maximum | BUG-0003 |
| BUG-0009 password 72-byte limit | BUG-0004 |
| BUG-0010 login ignores bytes after 72 | BUG-0004 |
| BUG-0011 no brute-force protection | QUESTIONS Q9–Q10 (implemented, disabled by configuration) |
| BUG-0012 login missing fields return 422 | BUG-0003 |
| BUG-0013 weak passwords | BUG-0003 (whitespace-only), QUESTIONS Q3 (policy) |
| BUG-0014 type coercion | BUG-0005 |

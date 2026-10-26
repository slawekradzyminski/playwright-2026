# Bug reports

Write all content in this folder in English.

## Structure

| Location | Contents |
| --- | --- |
| `functional/` | Wrong behavior of the application: data, security, business rules, error handling |
| `documentation/` | The OpenAPI contract or other documentation does not describe actual behavior |
| `QUESTIONS.md` | Findings that need a product or project decision before they become a bug or are accepted |
| `TEMPLATE.md` | Template for both report folders |

`BUG-NNNN` numbers are shared across both folders. Choose the next available
number and keep it after transferring the report to Jira.

## One report per root cause

Report the cause, not each symptom. Before writing a report, analyze the
backend code ([test-secure-backend](https://github.com/slawekradzyminski/test-secure-backend))
and group symptoms that share one fix into a single report with a symptom
table. Link the exact lines at a fixed commit. Create a separate report only
when the fix is in a different place. If a symptom belongs to an existing
report, add a row there instead of creating a new file. A documentation
mismatch caused by a functional bug is a row in the documentation report that
links to the functional one.

Include a minimal reproduction, expected and actual results, and evidence with
the verification date and environment. Distinguish runtime-confirmed behavior
from findings in code only. Exclude real account passwords, tokens and
personal data; use test data in examples.

## Jira

Copy the table values into the corresponding fields of a **Bug** issue and
paste the sections from **Description** onward into its **Description**
field. Adjust priority and component names to match the Jira project's
configuration. After creating the issue, add its link to the report's **Jira**
field. A file in this repository does not create a Jira issue automatically.

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

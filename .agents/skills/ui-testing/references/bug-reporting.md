# Bug reporting

Bugs live in `/bugs`, one Markdown file per report, written from [../assets/bug-template.md](../assets/bug-template.md). Report only confirmed findings (reproduced at least twice, from a known state).

## Before creating a file

1. Search `/bugs` for the same problem (`grep -ril "<keyword>" bugs`). If it is already reported, add new evidence or a new viewport to that report instead.
2. Find the next number: the highest existing `BUG-NNN` + 1 (`ls bugs | grep -o 'BUG-[0-9]*' | sort -u | tail -1`). In parallel sessions use a working name `BUG-<screen>-N` instead (screenshots `bugs/img/<screen>-*`); the merging session assigns the numbers (see [test-plan.md](test-plan.md)).

## File and title

- File: `bugs/BUG-NNN-<type>-<short-slug>.md`, `<type>` is `functional`, `visual`, `a11y` or `usability`, slug in kebab-case.
- Title: `# BUG-NNN [TYPE] <what is wrong, where>`, e.g. `# BUG-012 [VISUAL] Cart total overlaps the checkout button on mobile`.
- Screenshots: `bugs/img/BUG-NNN-<name>.png`, embedded in the report with `![…](img/BUG-NNN-<name>.png)`, so the problem is visible without opening anything else.

## One report or a collective one

- **Functional and visual** – one bug per report.
- **Accessibility and usability** – lower priority, collected in one open report per type (`BUG-NNN-a11y-<scope>.md`, `BUG-NNN-usability-<scope>.md`), each finding as its own section with Steps, Expected and Actual: either `##` per screen and `###` per finding (BUG-004), or `##` per finding prefixed with the screen (BUG-005). Follow the style of the report you extend. Add new findings to the existing open report (and extend its scope in the title/file name only if needed) instead of creating a new file. Accessibility findings name the WCAG criterion (e.g. `WCAG 2.4.7 Focus Visible`).

## Content rules

- The title says what and where, not "doesn't work".
- Steps start from a known state (role, test data, URL, viewport) and are minimal; anyone can repeat them.
- Expected and actual are concrete: texts, values, status codes, URLs; not opinions.
- Evidence attached; for visual bugs a screenshot of the broken viewport and of a correct one. For functional bugs, add the API request/response when it shows the cause.
- Environment: browser, viewport, frontend and backend version.
- Notes (optional): suspected cause, impact, workaround.

## Severity and priority

Severity is the impact on the user, priority is the order of fixing.

| Severity | Meaning |
|---|---|
| Blocker | no workaround, main flow impossible |
| Critical | data loss or security |
| Major | important function broken or a user group excluded |
| Minor | workaround exists, cosmetic impact on a few users |
| Trivial | polish |

Priority P1 (fix now) … P5 (maybe never). Security and data-loss bugs are at least P2.

## After reporting

- Mention the bug numbers in the session log of `docs/ui-test-plan.md`.
- If the bug deserves a regression test once fixed, add it to "Regression candidates" there.

## Example

See `bugs/BUG-002-functional-whitespace-only-password-accepted.md` (single functional bug) and `bugs/BUG-004-a11y-*.md` (collective report).

# Keeping the UI test plan current

`docs/ui-test-plan.md` is the single place that says what is covered, what is next and what exploration found. Update it in the same change as the tests or bug reports, never later.

## Coverage levels

The unit is a route from the frontend's `src/AppRoutes.tsx`.

| Level | Meaning |
|---|---|
| 0 – none | no test opens the screen |
| 1 – smoke | a test only checks that the screen opens (URL + title), e.g. after a menu click |
| 2 – functional | tests of the main flow and of validation/errors |

A screen reaches level 2 only when its planned scenarios for the main flow and validation are automated and passing.

## What to update

After automated tests:
1. "As of" line at the top: date and frontend/backend versions.
2. "Current state" row of each touched screen: level and spec files.
3. "Summary" table: counts and percentages (level ≥ 1, level 2, without tests). Recount from the table, do not adjust by hand.
4. The stage in "Plan for the next stages": strike the finished screen (`~~/route~~`), write **done YYYY-MM-DD** and the scenarios actually covered; move anything skipped to the remaining list. Update "Done / Still needed" for helpers (API clients, fixtures).
5. "Notes" when an approach changes (new fixture, new isolation trick, a new access-control check).
6. "Coverage forecast" row "now" (and later rows if the plan changed).

After an exploratory session:
1. A row in "Exploratory sessions": date, screens with roles and viewports, findings with bug numbers (or "no bugs").
2. "Regression candidates": bugs that should get a test once fixed.

New routes in the app: add them to "Current state" at level 0, renumber, and recompute the summary (the denominator changes).

## Parallel sessions

When several sessions work on different screens at once, each one changes only its own screen's rows (current state, stage, regression candidates), adds one session-log row, and appends new findings at the end of the shared a11y/usability reports. The merging session resolves the conflicts, renames working bug names (`BUG-<screen>-N`) to the next numbers in files, specs and the plan, and recounts the "As of" line, Summary, Notes and Coverage forecast.

## Style

Short, factual, English, tables over prose. Dates as `YYYY-MM-DD`. Route paths and file names in backticks.

# Maintain the compact UI test plan

Keep `docs/ui-test-plan.md` a compact current snapshot (aim for at most 65 lines). Retain the verified date, pinned frontend route source, last actual command/result/environment, one row per screen, coverage totals, short next behaviors and ordered priorities/prerequisites. Replace outdated facts; do not append session histories.

Reconcile routes with page/component implementations and active `tests/ui/` specs. A covered screen needs a dedicated active spec asserting screen-specific behavior beyond URL/root visibility. Mark destination-only checks as Navigation and unasserted screens as Planned; neither counts in the numerator. Page objects, fixtures, frontend unit tests and exploration alone do not establish automated coverage. Screen breadth does not imply complete scenario, role, visual or accessibility coverage.

Count record-independent screens/workflows once. Keep create/edit workflows separate; group inventory list/selection as one master/detail screen. Exclude redirect aliases, shared headers, dialogs and embedded sections; track their behavior with the host screen/component. Explain denominator changes when routes or screen structure change. Check guards inside pages as well as route guards when assigning access labels.

After UI coverage changes, update row statuses, covered/total percentage, active test totals and next priorities. Reconcile screen and shared-component test counts without inflating screen coverage. Record only actual execution evidence and do not advance its date without a run. Keep reproduction details in `docs/bugs/ui/`, scratch evidence in ignored `exploration/ui/`, and shared automation rules in `AGENTS.md`.

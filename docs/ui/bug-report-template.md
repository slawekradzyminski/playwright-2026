# UI bug naming

Use the same filename structure as API reports: `[severity][type] ID - Short description.md`.
Example: `[M][A11Y] UI-01 - Validation errors are not associated with inputs.md`.

Types: **FUI** functional UI, **VIS** visual, **A11Y** accessibility, **CON** console, **NET** network, **PERF** performance, **UX** user experience.
Keep stable UI-NN IDs. Assess impact before assigning severity, then update the filename and register links. Use the type code in the report heading; severity belongs after the impact assessment, as in API reports.

Copy the template below for each independently fixable issue.

---

# [type] Screen — observable problem

**ID:** UI-NN  
**Status:** Open / Needs clarification / Fixed, awaiting retest / Verified  
**Category:** FUI / VIS / A11Y / CON / NET / PERF / UX  
**Observed on:** YYYY-MM-DD

## Environment and preconditions

- URL, app build (unknown if not verified), test revision:
- Browser/version, OS, viewport in CSS pixels, DPR, zoom, touch/mobile mode:
- Role/data and starting state (no secrets):
- Cache, network/CPU throttling and relevant settings:

## Steps to reproduce

1. Open the screen in the stated initial state.
2. Perform the minimal action.
3. Inspect the visible or measured result.

## Actual result and evidence

Describe what occurred. Include observed reproduction counts, exact messages, accessible properties, or sanitized request method/path/status/count/timing as relevant.

![State showing the problem](../../../exploration/ui/<session>/<profile>-<state>.png)

Caption the affected area. Link full-page and viewport evidence when they answer different questions. Raw evidence is ignored/local; include the essential facts here so the report remains actionable in another checkout. Attach selected sanitized images when publishing externally.

## Expected result and basis

State the expected behavior and its requirement/design/WCAG basis. For subjective UX decisions state the proposal and question instead of inventing a requirement. Distinguish confirmed facts from suspected causes.

## Impact assessment

Who is affected, which task is disrupted, scope, consequence, workaround and uncertainties?

## Severity decision

Explain the classification after assessing impact.

**Severity:** H / M / L (provisional when needed)

H: demonstrated core-flow blockage, data exposure or comparable serious impact.  
M: materially impaired task or accessibility, with the core happy path still usable.  
L: limited clarity/usability issue or small measured waste.

## Acceptance criteria and retest

- [ ] Reproduction now produces the agreed expected result.
- [ ] Check the relevant states at desktop/tablet/mobile sizes.
- [ ] Verify keyboard/assistive semantics and neighboring flows as applicable.
- [ ] Link regression coverage or state why manual review is needed.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

State created sessions/data and cleanup. Distinguish live behavior from injected failures and list checks not performed.

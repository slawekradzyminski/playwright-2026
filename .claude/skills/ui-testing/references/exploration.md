# Exploratory UI testing

Explore to discover consequential bugs and challenge assumptions about the requested UI. Existing tests and the ideas below are starting points, not a specification or a checklist to exhaust. Use the global **playwright-cli** skill for live browser exploration, including `run-code` for measurements and controlled experiments.

## Choose the investigation

Form a brief testing objective from the user's request, the screen's purpose, existing coverage and known findings. Identify what users should achieve, what must remain true, and where failure would matter. Keep this lightweight: a sentence or short scratch note is enough, not a plan that needs approval.

Choose your own experiments, order, data, and depth. Draw on your testing knowledge and invent probes beyond these examples. Follow surprising behavior, weak feedback, inconsistent state and suspicious traffic; change direction when evidence suggests a better hypothesis. Routine exploratory choices within the authorized scope do not require confirmation. Investigate adjacent behavior when it explains a finding, without turning that into an unrelated screen's test suite.

For a useful experiment, ask: what might be wrong, what observation would distinguish it from correct behavior, and what would change my mind? Observe the result, update the hypothesis, and choose the next probe. Try a contrasting case or alternative explanation before diagnosing a cause. Record concise observations and decisions that help reproduce or assess a finding; do not narrate every click or write an exhaustive reasoning diary.

Prioritize likely or high-impact failures and uncertain transitions over repeating familiar happy paths. A promising anomaly deserves follow-up even if it interrupts the initial plan. Conversely, leave an unproductive line of investigation when new probes add little information. Do not equate creativity with random input, huge boundary matrices, or a required number of novel tests.

## Lenses to draw from

Select and combine these where they help; they are neither ordered phases nor mandatory cases for every screen.

- **Intent and side effects:** Does an action do only what its label promises? Compare visible success with HTTP and persisted state. Think about cancel, back, navigation and other secondary actions as well as submit.
- **State and sequence:** What changes if a user edits, retries, leaves and returns, refreshes, or acts after an error? Probe combinations and transitions that isolated controls would miss.
- **Timing and concurrency:** Where could a delayed response, repeated action, interrupted request, stale tab or changed session produce conflicting state? Use controlled experiments when they test a concrete hypothesis; label injected conditions.
- **Data and rules:** Which meaningful boundaries, relationships between fields, roles or existing records could contradict the apparent rules? Choose representative inputs rather than mechanically enumerating values.
- **Perception and access:** Can users perceive, reach and recover from the action with different viewports, keyboard use or assistive semantics? Inspect screenshots and DOM properties as appropriate; measure suspected contrast failures.
- **Feedback and cost:** Are errors useful, inputs preserved, loading states understandable and requests proportionate? Investigate surprising latency, duplication, failures or console exceptions rather than assuming they are defects.

For example, a secondary action inside a form may behave differently once data is valid: empty-form validation can hide accidental submission. Testing navigation with valid unsaved data and checking for forbidden mutations is a high-value probe here. Use empty or invalid states as contrasting cases when informative, not as a universal three-state matrix for every control. Inspect effective button type and form ownership if the evidence points toward unintended submission. Apply the broader lesson—combine action, state and side effects—to other screens instead of merely replaying the registration example.

## Evidence that makes exploration credible

Freedom to choose experiments does not relax evidence, scope or cleanup requirements.

Record enough environment context to reproduce findings: URL, date, browser/version, build (or unknown), repository revision, role, fake data, viewport/emulation and relevant zoom/cache/throttling settings. Use a named CLI session and keep scratch scripts, screenshots and sanitized measurements in ignored `exploration/ui/<screen>-YYYY-MM-DD/`. Use API setup/cleanup as directed by `AGENTS.md`; clean up disposable data and sessions even after failures.

For a screen exploration, capture and **open screenshots** at the desktop, tablet and mobile baselines below. Choose states and viewport/full-page captures that answer actual layout questions; a gallery of every state at every size is unnecessary. Wait for meaningful readiness and distinguish animation from persistent clipping. A focused reproduction needs only the visual evidence relevant to the suspected defect. Resized desktop screenshots do not establish real-device or screen-reader correctness. Subjective design concerns belong under **Needs clarification**, not invented requirements.

Assess visual composition separately from functional correctness. Readable text, working links and absence of clipping do not establish that an interface looks coherent. In the screenshots relevant to the task, consider hierarchy, alignment, spacing/density, grouping and the relative prominence of controls against the surrounding design. Explain a concern through visible evidence and its likely user consequence; distinguish observed impairment from a design judgment, and do not invent layout defects merely to produce findings. Raise supported design concerns when first observed, using **Needs clarification** if product intent is unresolved; an explicit user decision can establish an accepted issue. Qualify positive conclusions by what was actually assessed. If challenged, reassess the same evidence independently and explain what was missed or newly established rather than simply reversing the verdict to agree with the user.

Treat responsive coverage as behavior and state coverage, not just viewport coverage. When an in-scope control hides relevant content (for example, collapsed navigation), open it and inspect the revealed state at the viewport where users encounter it; a screenshot of the trigger alone does not cover the component. Choose meaningful transitions such as closing, selecting a destination or changing authentication state, and check their visible result and relevant focus/state semantics. Capture and open evidence of the revealed layout when assessing it visually. Select states by the user task and observed risk rather than expanding this into every control/state/viewport combination; explicitly distinguish unexamined states in coverage claims.

Capture HTTP traffic before the actions under investigation and actually review it against user intent, including successful responses and actions expected to send no mutation. Keep a compact, sanitized record linking meaningful actions and form/session state to expected and forbidden effects, observed method/path/count/status, and resulting UI/backend state. JSON, CSV, text, or annotated request snapshots are all acceptable; no entry for every keystroke is needed. Include duration, failed or pending requests and observation bounds when relevant to the claim. A log that was saved but not reviewed does not establish network analysis.

CLI `requests` snapshots before/after an action can establish the delta by request ID; preserve both if cumulative. Inspect relevant details locally. Do not stop at the destination URL: requests can complete later. Observe pending requests through completion/failure and use a bounded window for suspected delayed work; absence claims apply only to that window. Verify suspected mutations through a read API where possible. Redact credentials, cookies, tokens, personal data and sensitive query parameters. HAR/traces are optional local diagnostics and can contain secrets; prefer sanitized evidence for review.

Collect console/page errors around investigated actions and distinguish expected negative responses, injected failures and tooling problems from application defects. For performance findings, report sample counts and conditions and repeat suspicious measurements. Requests over 1 s or a usable screen taking over 2.5 s are investigation hints, not SLAs; user-visible delay or unusual behavior can justify investigation below those values too. Flag material delays promptly. Do not generalize local timing to field performance.

If tooling fails, recover or state which observations are missing. Separate observed behavior, inferred cause and untested consequences. A correct URL, a quiet console or a passing regression suite cannot substitute for checking the relevant business effect.

## Decide when to finish

Finish when the requested scope has a credible evidence-based assessment: important user outcomes and plausible failure modes have been explored, promising anomalies have been reproduced or clearly left unresolved, and additional probes are yielding little useful information. Respect explicit time or scope limits. No fixed number of probes, bugs or completed checklist items establishes completeness.

Before closing, challenge your own coverage: what important behavior have I only assumed, which states or side effects might hide a defect, and would one contrasting experiment materially improve confidence? Choose the answer from the screen and observations. State meaningful gaps and unresolved risks rather than claiming exhaustive coverage.

Use [bug reporting](bug-reporting.md) for actionable findings, preserving essential sanitized evidence in individual reports and the UI register. Keep scratch investigation notes local; do not create separate per-screen reports or screenshot galleries. Explain findings, coverage and limits briefly to the user. Lead with the observed impact and supporting evidence; use plain prose and only as much structure as the result needs.

If automation is requested, then use [automation](automation.md) to select a small set of valuable business regressions from what was learned. Its small-suite constraint does not limit exploratory breadth. Document proposed regressions for open defects, including forbidden side effects; do not encode a defect as expected behavior. Follow [review and improvement](review-and-improvement.md) for code verification and closeout.

## Viewport baseline

Selected on 2026-09-11 from Statcounter worldwide **August 2026** data:

| Profile | CSS viewport | Reported screen share | Source |
|---|---|---|---|
| Desktop | 1920 × 1080 | 22.22% | [Desktop](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide) |
| Tablet, portrait | 768 × 1024 | 8.79% | [Tablet](https://gs.statcounter.com/screen-resolution-stats/tablet/worldwide) |
| Mobile, portrait | 414 × 896 | 13.63% | [Mobile](https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide) |

These are the leading reported sizes in each category, used as representative CSS viewport targets. Screen resolution is not available browser content height: browser chrome, zoom, DPR and the software keyboard change the usable area. Global traffic is a starting point; revisit with product analytics. Configuration lives in `ui-viewports.ts`. Automated UI tests run on desktop only (1920 × 1080), per the product decision on 2026-09-11. Tablet/mobile sizes are exploratory targets, not test projects. Resizing a CLI desktop session only checks responsive layout and does not replace real-device Safari, keyboard, or screen-reader testing.

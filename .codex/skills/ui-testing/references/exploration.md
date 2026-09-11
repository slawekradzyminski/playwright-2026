# Exploratory UI testing

Explore the deployed screen before designing tests. Existing tests are hints, not a specification. Use the global **playwright-cli** skill and CLI browser sessions, including `run-code` for measurements and controlled experiments.

## Viewport baseline

Selected on 2026-09-11 from Statcounter worldwide **August 2026** data:

| Profile | CSS viewport | Reported screen share | Source |
|---|---|---|---|
| Desktop | 1920 × 1080 | 22.22% | [Desktop](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide) |
| Tablet, portrait | 768 × 1024 | 8.79% | [Tablet](https://gs.statcounter.com/screen-resolution-stats/tablet/worldwide) |
| Mobile, portrait | 414 × 896 | 13.63% | [Mobile](https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide) |

These are the leading reported sizes in each category, used as representative CSS viewport targets. Screen resolution is not available browser content height: browser chrome, zoom, DPR and the software keyboard change the usable area. Global traffic is a starting point; revisit with product analytics. Configuration lives in `ui-viewports.ts`. Automated UI tests run on desktop only (1920 × 1080), per the product decision on 2026-09-11. Tablet/mobile sizes are exploratory targets, not test projects. Resizing a CLI desktop session only checks responsive layout and does not replace real-device Safari, keyboard, or screen-reader testing.

## Session process

1. Record URL, date, browser/version, app build (or unknown), test repository revision, role, data, viewport, device emulation, zoom, and network/CPU settings. Review existing bugs and requirements.
2. Create `exploration/ui/<screen>-YYYY-MM-DD/` (already ignored). Open a named CLI session. Capture the initial accessibility snapshot, discover test IDs, and inventory actions and states.
3. Inspect initial, validation, rejected, loading, successful, and recovery states. Exercise keyboard Tab/Shift+Tab/Enter/Escape, boundaries, navigation, refresh, and relevant session transitions. Use fake data. Clean up sessions/fixtures afterwards.
4. At all three baseline viewports capture both the visible viewport and, when useful, the full page. Name files `<profile>-<state>.png`. Wait for meaningful UI readiness; disable animations for settled screenshots, but inspect the real transition separately. Do not mistake an animation frame for clipping.
5. **Open and visually inspect the screenshots yourself.** Accessibility snapshots cannot establish visual correctness. Look for clipping, horizontal scrolling, wrapping, overlap, spacing, hierarchy, touch targets, focus, toasts covering actions, and responsive menus. Share inline images or absolute clickable file paths during the session. Keep screenshots together in the session folder; do not generate an HTML gallery.
6. For subsequent sessions compare the same state/data/viewport against previously reviewed evidence. Record changes and ask the user about subjective design differences. First-session screenshots are a candidate baseline, not an approved golden image. Agent visual review is not pixel-diff regression or a conformance certification.
7. Accessibility: inspect accessible names, labels, headings/landmarks, error associations and invalid state, live announcements, focus order/visibility, keyboard traps, autofill purpose, contrast, reflow/zoom, and touch targets. Measure suspected contrast failures and document colors/backgrounds. Automated scanners may supplement this; explicitly list checks not performed.
8. Console: collect `playwright-cli console`, page exceptions and failed resources from before the action. Separate expected negative-response logs, injected failures and tooling warnings from application defects.
9. Network: use `playwright-cli requests`, request details, and response timing listeners. Correlate user intent with method/path/count/status and observable effects. Check duplicate calls, unnecessary fetches, retries, cancellations and leaks. Distinguish reloads, redirects, preflights and intentional polling from waste. Redact credentials, cookies, tokens, personal data and OAuth query parameters.
10. Performance: record navigation and action-to-result timing plus request durations, sample counts, cache and throttling conditions. Notify the user immediately about a suspicious delay. As initial **investigation triggers**, use >1 s for an interactive API request or >2.5 s for a usable screen, unexplained repeated requests, or visibly blocked input. These are triage heuristics, not agreed SLAs. Repeat small samples and separate backend timing from rendering/network cost; do not claim a local sample represents field performance.
11. UX: check loading feedback, prevention of duplicate submissions, error clarity/persistence, recovery without retyping, discoverability, back navigation and effort on smaller screens. Report clear failures directly. Record subjective improvements as **Needs clarification**, show evidence, and ask the user while continuing independent work.
12. Do not create separate per-screen or per-endpoint exploration reports. Summarize outcomes briefly in the conversation; preserve actionable findings in individual bug reports. Write reproducible repository reports using the [UI template](bug-report-template.md) and its `[severity][type] ID - Short description.md` naming convention, with impact before severity. Keep one fixable issue per report. Add them to [the UI register](../../../../docs/bugs/ui/README.md). No external issue publication is implied. Preserve essential sanitized DOM/network evidence in committed reports; raw screenshots stay in exploration unless explicitly selected for durable inclusion.
13. For implementation, follow [automation](automation.md). Only then automate a small set of business end-to-end flows. Keep one representative client-validation case; leave detailed boundary matrices to lower-level tests. Exploration coverage does not imply a separate UI test for every observation. Keep one spec per screen, assertions in page objects/components, and compose reusable headers/toasts. Use meaningful positive outcomes and precise negative messages. Keep known defects in reports; never bless defective behavior as the expected contract. Separate mocked resilience checks from live integration checks.
14. Run `npm run test:ui`, TypeScript checking and `npm run test:api` as appropriate. Briefly state actual totals, limitations and cleanup in the conversation. Link the screenshot folder and bug findings.

## CLI examples

```sh
mkdir -p exploration/ui/login-YYYY-MM-DD
playwright-cli -s=login open http://localhost:8081/login
playwright-cli -s=login resize 1920 1080
playwright-cli -s=login snapshot --filename=exploration/ui/login-YYYY-MM-DD/desktop-initial.yaml
playwright-cli -s=login screenshot --filename=exploration/ui/login-YYYY-MM-DD/desktop-initial.png
playwright-cli -s=login console
playwright-cli -s=login requests
playwright-cli -s=login close
```

Repeat at 768 × 1024 and 414 × 896. For full-page settled screenshots use `page.screenshot({ path, fullPage: true, animations: 'disabled' })` through CLI `run-code`. Keep scenario scripts and sanitized raw measurements with the session.

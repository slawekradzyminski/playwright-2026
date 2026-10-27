# UI questions for product and design

## Login exploration, 2026-10-27

| # | Question / owner | Observation | Decision needed |
| --- | --- | --- | --- |
| UI-Q1 | Product/design: should the login form and primary action be visible without scrolling on common phone screens? | At 402 × 874 in Chromium emulation the username starts about 582 px down and the sign-in button ends at 834 px; the hero and notice occupy much of the initial screen. At 360 × 800 the content is taller. Mobile browser chrome and keyboard can reduce usable space further. | Agree on the desired mobile layout and whether scrolling is acceptable; no requirement currently establishes this as a defect. |

UI-Q2 (viewport and browser coverage) was resolved on 2026-10-27: use the three targets and Chromium emulation described in [UI test rules](../../docs/ui-test-rules.md).

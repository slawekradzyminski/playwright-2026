# UI questions for product and design

## Login exploration, 2026-10-27

| # | Question / owner | Observation | Decision needed |
| --- | --- | --- | --- |
| UI-Q1 | Product/design: should the login form and primary action be visible without scrolling on common phone screens? | At 402 × 874 in Chromium emulation the username starts about 582 px down and the sign-in button ends at 834 px; the hero and notice occupy much of the initial screen. At 360 × 800 the content is taller. Mobile browser chrome and keyboard can reduce usable space further. | Agree on the desired mobile layout and whether scrolling is acceptable; no requirement currently establishes this as a defect. |

UI-Q2 (viewport and browser coverage) was resolved on 2026-10-27: use the three targets and Chromium emulation described in [UI testing skill](../../.agents/skills/ui-testing/SKILL.md).

## Product catalog exploration, 2026-10-28

| # | Question / owner | Observation | Decision needed |
| --- | --- | --- | --- |
| UI-Q3 | Product/design: how much vertical space should categories occupy on phone/tablet? | With nine categories at 402 × 874 and 820 × 1180, the full category list precedes search and products. The first product requires scrolling; filters remain usable and no horizontal document overflow was found. | Decide whether to collapse categories, use a compact selector, or retain this hierarchy. This is a usability recommendation, not a proven layout defect. |
| UI-Q4 | Product/design: what availability and recovery feedback should catalog cards provide? | An out-of-stock card disables Add to Cart but shows no explicit stock explanation. A real insufficient-stock 409 uses the same generic “Failed to update cart. Please try again.” feedback as an injected 500. Retrying with an available quantity succeeds. | Agree on stock labels, available-quantity feedback and actionable conflict wording before encoding these preferences as assertions. |
| UI-Q5 | Product/design: should quantity editing remain enabled during a cart write? | While an update from 1 to 2 was held pending, increasing the displayed quantity to 3 remained possible. Completion reset it to the saved 2 without retaining the later edit. Only one mutation was sent. | Decide whether to disable quantity editing while pending or preserve later unsaved edits with clear feedback. The separate transport guard defect is BUG-0023. |
| UI-Q6 | Product/design: what fallback and truncation behavior is intended for extreme catalog content? | A valid nonempty image URL that cannot be decoded renders the browser's broken-image/alt-text display rather than the missing-image placeholder. A long category is clipped inside its card on phone/tablet while the document itself stays within the viewport. Long product names/descriptions are clamped; a large price remains readable. | Agree on failed-image fallback and how users should access full clipped category text. These observations do not establish a requirement violation. |

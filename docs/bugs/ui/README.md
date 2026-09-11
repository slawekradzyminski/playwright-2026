# UI findings

Login, registration, homepage and header exploration, 2026-09-11. Repository reports; no external issues filed. See [workflow](../../../.codex/skills/ui-testing/references/exploration.md) and [template](../../../.codex/skills/ui-testing/references/bug-report-template.md).

Severity review on 2026-09-11 considered each report’s recorded consequence, scope, workaround and uncertainty before selecting its rating. UI-10 was subsequently raised to Medium using the user’s mobile-customer exposure context; this evidence review is not a live retest or fix verification. Each report contains its specific rationale before the decision.

| Finding | Observed impact | Severity | Status |
|---|---|---|---|
| [UI-01 — Validation errors are not associated with inputs](%5BM%5D%5BA11Y%5D%20UI-01%20-%20Validation%20errors%20are%20not%20associated%20with%20inputs.md) | Assistive-technology users returning to a field cannot retrieve its error through the field description or invalid state. | M | Open |
| [UI-02 — Login and registration inputs omit autocomplete purpose](%5BL%5D%5BA11Y%5D%20UI-02%20-%20Login%20inputs%20omit%20autocomplete%20purpose.md) | Users relying on autofill and cognitive assistance receive less reliable input-purpose metadata. | L | Open |
| [UI-03 — Placeholder text has insufficient contrast](%5BL%5D%5BA11Y%5D%20UI-03%20-%20Placeholder%20text%20has%20insufficient%20contrast.md) | Low-vision users may struggle to read placeholders. | L | Open |
| [UI-04 — Input focus ring has insufficient contrast](%5BM%5D%5BA11Y%5D%20UI-04%20-%20Input%20focus%20ring%20has%20insufficient%20contrast.md) | Keyboard users with low vision have difficulty identifying the active credential field. | M | Open |
| [UI-05 — Authenticated cart link has no accessible name](%5BM%5D%5BA11Y%5D%20UI-05%20-%20Authenticated%20cart%20link%20has%20no%20accessible%20name.md) | Screen-reader users cannot identify the icon link purpose. | M | Open |
| [UI-06 — Successful login fetches the profile twice](%5BL%5D%5BNET%5D%20UI-06%20-%20Successful%20login%20fetches%20the%20profile%20twice.md) | Each login performs one apparently unnecessary profile request. | L | Open |
| [UI-07 — Sign in submits registration with valid data](%5BM%5D%5BFUI%5D%20UI-07%20-%20Sign%20in%20submits%20registration%20with%20valid%20data.md) | Leaving a populated form creates an account despite the user choosing login navigation. | M | Open |
| [UI-08 — Home welcome panel clips content on mobile](%5BL%5D%5BVIS%5D%20UI-08%20-%20Home%20welcome%20panel%20clips%20content%20on%20mobile.md) | Mobile-width users cannot read complete welcome text, email and shortcut descriptions. | L | Open |
| [UI-09 — Mobile navigation toggle omits expanded state](%5BM%5D%5BA11Y%5D%20UI-09%20-%20Mobile%20navigation%20toggle%20omits%20expanded%20state.md) | Assistive-technology users cannot read the expanded state of primary navigation from its toggle. | M | Open |
| [UI-10 — Expanded navigation has excessive visual weight and inconsistent alignment](%5BM%5D%5BUX%5D%20UI-10%20-%20Expanded%20navigation%20has%20excessive%20visual%20weight%20and%20inconsistent%20alignment.md) | A prominent account card and mixed alignment affect primary navigation; the user reports substantial mobile customer exposure. | M | Open |

Ten open findings: six Medium and four Low.

Screenshots: `exploration/ui/login-2026-09-11/` (local, ignored). Mobile introduction height and toast overlap remain UX review items by product decision; they are not filed as bugs.

Registration evidence: `exploration/ui/register-2026-09-11/` (local, ignored). UI-01 and UI-02 also affect registration. Registration exploration covered live creation/sign-in, duplicate rejection, required/minimum-length and email validation, keyboard field navigation, refresh and logout, and responsive screenshot review. The disposable account was deleted. No real-device, screen-reader, exhaustive boundary, or throttled performance audit was performed.

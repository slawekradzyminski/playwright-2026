# Exploratory testing procedure

Exploratory testing complements the automated suite: it looks for defects nobody wrote a test for. Run a session for every screen that reaches coverage level 2 (see [ui-test-plan.md](ui-test-plan.md)) and after major UI changes.

The only output of a session is bug reports in [`/bugs`](../bugs), one file per bug, written from [`bugs/TEMPLATE.md`](../bugs/TEMPLATE.md). No session report is written.

## 1. Prepare the session

1. Write a **charter**: which screens, which roles, what you look for. One session = one group of related screens, about 60–90 minutes.
2. Record the **environment**: frontend and backend versions, URL, browser and version.
3. Prepare **test data through the API**, not the UI: a fresh client per check (`POST /api/v1/users/signup`), the admin from `.env`. Include awkward data on purpose: long names with diacritics, HTML/script in text fields, whitespace.
4. Use these **viewports**:

| Name | Size | Device |
|---|---|---|
| desktop | 1920×1080 | typical desktop |
| tablet | 820×1180 | iPad Air, touch |
| mobile | 393×852 | iPhone 16/17, touch, `isMobile` |

Tools: `playwright-cli` or a throwaway Playwright script (do not commit it), DevTools, screen reader (VoiceOver) for spot checks.

## 2. Explore — four aspects

Every screen is checked for each role that can open it (anonymous / client / admin).

### Functional
- Happy path and every alternative path (buttons, links, Enter key, Back button).
- Validation: empty fields, too short / too long, invalid format, whitespace-only, leading/trailing spaces, duplicates.
- Server errors: wrong credentials, already existing data. Message must be shown and understandable.
- Session and access: deep links as anonymous, opening anonymous pages while logged in, logout and Back, refresh.
- Injection: HTML/script in text fields must render as text.
- Console and page errors: there must be none.

### Visual (on each of the 3 viewports)
- Full-page screenshot of every state (empty, filled, errors, toast, open menu).
- No horizontal scroll (`scrollWidth > innerWidth`), no element outside the viewport, no clipped or overlapping text.
- Repeat with long data (long names, long emails).
- Layout switches correctly (desktop menu vs hamburger), touch targets at least 24×24 px.

### Accessibility (WCAG 2.2 AA)
- Keyboard only: Tab order follows visual order, focus is always visible, no traps, Escape closes menus/dialogs.
- Accessibility tree (`ariaSnapshot()` or DevTools): every control has a name, icon-only links/buttons have `aria-label`, toggles expose `aria-expanded`.
- Forms: labels linked to inputs, errors linked with `aria-describedby` and `aria-invalid`, `autocomplete` on personal data.
- Structure: `lang` on `<html>`, unique `<title>` per page, one `h1`, logical heading levels, landmarks (`main`, `nav`).
- Contrast: 4.5:1 for normal text, 3:1 for large text and UI components. Check computed colours; automated contrast scripts give false positives on translucent backgrounds, so confirm by eye.

### Usability
- Is it clear what to do and what happened (feedback after every action)?
- Does the app prevent mistakes (trimming, autocomplete, keeping entered data after an error)?
- Is the behaviour consistent between screens and viewports?
- Would a real user be surprised (e.g. silent logout, lost input)?

## 3. Report bugs

Every finding is confirmed (reproduced at least twice) before it is reported.

1. Copy [`bugs/TEMPLATE.md`](../bugs/TEMPLATE.md) to `bugs/BUG-NNN-<type>-<short-slug>.md`. `NNN` continues from the highest existing number; `<type>` is `functional`, `visual`, `a11y` or `usability`.
2. The title starts with the number and the type tag: `# BUG-012 [VISUAL] Cart total overlaps the checkout button on mobile`.
3. Accessibility and usability findings have lower priority: collect them in one report per type (`BUG-NNN-a11y-<scope>.md`, `BUG-NNN-usability-<scope>.md`), grouped by screen, each finding as its own section with Expected and Actual. Add new findings to the existing open report instead of creating a new file. Functional and visual bugs get one report each.
4. Save screenshots to `bugs/img/BUG-NNN-<name>.png` and embed them in the report (`![…](img/BUG-NNN-<name>.png)`), so the problem is visible without opening anything else.

Rules for a good report:
- One bug per report; the title says what and where, not "doesn't work".
- Steps start from a known state and are minimal; anyone can repeat them.
- Expected and actual are concrete (texts, values, status codes), not opinions.
- Evidence attached; for visual bugs a screenshot of the broken and of a correct viewport.
- Severity is the impact on the user, priority is the order of fixing.

Severity guide: **Blocker** – no workaround, main flow impossible; **Critical** – data loss or security; **Major** – important function broken or a user group excluded; **Minor** – workaround exists, cosmetic impact on a few users; **Trivial** – polish.

## 4. Close the session

For each reported bug decide whether a regression test belongs in the automated suite once it is fixed.

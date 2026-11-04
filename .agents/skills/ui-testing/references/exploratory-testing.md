# Exploratory testing procedure

Exploratory testing complements the automated suite: it looks for defects nobody wrote a test for. Run a session for every screen that reaches coverage level 2 (see `docs/ui-test-plan.md`) and after major UI changes.

The output of a session is bug reports in `/bugs` (see [bug-reporting.md](bug-reporting.md)) and one row in the session log of `docs/ui-test-plan.md` (see [test-plan.md](test-plan.md)). No separate session report is written.

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

Tools: `playwright-cli` or a throwaway Playwright script (do not commit it), DevTools, screen reader (VoiceOver) for spot checks. Keep throwaway scripts in the scratchpad and run them with `NODE_PATH=<repo>/node_modules node x.cjs`; set up their data through the API inside the script. Chromium's `BarcodeDetector` can decode QR codes during exploration on macOS (not on Linux CI, so never in the suite).

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
- Contrast: 4.5:1 for normal text, 3:1 for large text and UI components. Check computed colours; automated contrast scripts give false positives on translucent backgrounds and cannot parse `oklch()` colours, so convert or confirm by eye.

### Usability
- Is it clear what to do and what happened (feedback after every action)?
- Does the app prevent mistakes (trimming, autocomplete, keeping entered data after an error)?
- Is the behaviour consistent between screens and viewports?
- Would a real user be surprised (e.g. silent logout, lost input)?

## 3. Report bugs

Confirm every finding (reproduce it at least twice), then report it following [bug-reporting.md](bug-reporting.md). Take screenshots while exploring; they are the evidence.

## 4. Close the session

1. Add a row to "Exploratory sessions" in `docs/ui-test-plan.md`: date, screens (roles, viewports), findings with bug numbers.
2. For each reported bug decide whether a regression test belongs in the automated suite once it is fixed; list it under "Regression candidates".
3. Delete throwaway scripts and screenshots that did not end up in `bugs/img/`.

# BUG-032: Expanded mobile navigation obscures the footer heading

## Classification

- Type: Functional (UI layout)
- Status: Suspected
- Severity (proposed): Low — expanded navigation and partially visible footer visually run together.

## UI route and environment

`/`, http://localhost:8081/, 2026-09-09. Chromium 152.0.7977.77 on macOS, 360×800 resized desktop viewport. Deployed version not recorded; authenticated ROLE_CLIENT.

## Preconditions and reproduction

1. Sign in and open the homepage at 360×800.
2. Scroll the footer into view.
3. Open the mobile menu using the top-right toggle.
4. Compare the footer before and after opening the menu.

## Expected

Assumption requiring design clarification: expanded navigation should have a clear visual boundary from background content, without leaving a partly obscured footer appearing to continue the menu. A sticky menu may intentionally cover page content; overlap alone does not establish incorrect behavior.

## Actual

The menu covers the footer heading; the footer description begins immediately beneath the account group, followed by external-link buttons. The local navigation source uses sticky positioning. The screenshot does not establish blocked interaction or a modal/backdrop requirement.

## Evidence

![Expanded mobile menu above partially obscured footer](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-homepage-0757/screenshots/360-menu.png)

[Before opening menu](../exploration/ui/2026-09-09-homepage-0757/screenshots/360-footer.png) and [review index](../exploration/ui/2026-09-09-homepage-0757/review.md). Images are ignored and available only in the originating workspace; they will not render in another checkout or on GitHub without separate sharing. Reassessed from existing screenshots; no fresh browser reproduction in this follow-up.

## Cleanup and follow-up

Original disposable user deleted; no new resources. Clarify intended expanded-menu treatment before asserting a particular overlay, backdrop or reflow design. Keep tracked as suspected; no automated assertion added for this appearance.

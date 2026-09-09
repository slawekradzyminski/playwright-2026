# BUG-031: Mobile menu Logout label is centered unlike adjacent account links

## Severity rationale

Logout is centered while adjacent account links are left-aligned. The record shows a presentation inconsistency without unreadable text, blocked activation or unexpected session behavior. No recovery action is needed to use the menu.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Functional (UI layout)
- Category: ui
- Tags: ui
- Status: Open
- Severity (proposed): Low

## UI route and environment

`/`, http://localhost:8081/, 2026-09-09. Chromium 152.0.7977.77 on macOS, 360×800 resized desktop viewport. Deployed version not recorded; authenticated ROLE_CLIENT.

## Preconditions and reproduction

1. Sign in as a disposable client account.
2. Set viewport to 360×800 and open the mobile navigation menu.
3. Compare Cart, the account name, and Logout within the same bordered group.

## Expected

Account controls use consistent left alignment. Supporting source evidence: Navigation.tsx applies `justify-start` to the mobile Logout button. No separate design specification was supplied.

## Actual

Cart and Timothy Wehner are left-aligned, but Logout is centered. Local source combines `block` with `justify-start` on this button; investigate whether block display prevents the intended flex alignment. The screenshot confirms the alignment difference, not the computed-style cause.

## Evidence

![Mobile menu with centered Logout at 360×800](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-homepage-0757/screenshots/360-menu.png)

[Review index](../exploration/ui/2026-09-09-homepage-0757/review.md). Screenshot is ignored and available only in the originating workspace, not portable to GitHub or another checkout. Reassessed from the original exploration image and the user's matching screenshot; no fresh browser reproduction in this follow-up.

## Cleanup and follow-up

Original disposable account was deleted. No new resources created. Verify alignment after the application fix; do not encode the misalignment as correct behavior.

# BUG-030: Homepage welcome panel clips content on narrow screens

## Classification

- Type: Functional (responsive UI)
- Status: Open
- Severity (proposed): Medium — mobile users cannot read the complete introduction, email or shortcut descriptions.

## UI route and environment

`GET /` at http://localhost:8081/, observed 2026-09-09. Chromium 152.0.7977.77 on macOS, resized desktop browser at 360×800 and 375×800. Application version not recorded. Disposable ROLE_CLIENT account, first name Timothy, last name Wehner, generated example.test email.

## Preconditions

Create a disposable user through the signup API and log in through the signin API. Seed the returned token and refreshToken in localStorage for the app origin, or sign in normally. No special account or catalog data required.

## Reproduction

1. Set the browser viewport to 360×800 CSS pixels.
2. Navigate to `/` and wait for the welcome title and account email to render.
3. Read the introduction, email, and Products/Users/Profile & Orders shortcut descriptions.
4. Repeat at 375×800; compare with 768×1024.

## Expected

Responsive content should wrap within the welcome panel so users can read the introduction, identity and action descriptions. This expectation is based on readable responsive content, not a supplied pixel-perfect design specification.

## Actual

The welcome panel cuts off the right-hand content. At 360px its clientWidth is 326px and scrollWidth is 436px, with computed overflow `hidden`. The document itself has no horizontal overflow, so a document-width assertion would miss the defect. Reproduced on repeated 360px visits and at 375px; tablet and desktop samples did not show this clipping. Products remains clickable.

The local frontend welcome section uses an overflow-hidden wrapper and a grid without explicit narrow-width track sizing; investigate intrinsic grid sizing and email wrapping. This is a suspected cause, not a verified fix.

## Evidence

![Homepage welcome panel clipped at 360×800](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-homepage-0757/screenshots/360-initial.png)

![Same clipping at 375×800](/Users/slawek/IdeaProjects/playwright-2026/reports/exploration/ui/2026-09-09-homepage-0757/screenshots/375-initial.png)

[Complete exploration and screenshot index](../exploration/ui/2026-09-09-homepage-0757/review.md), including browser events and measurements in states.txt. Screenshots are ignored and available only in the originating workspace; they will not render in another checkout or on GitHub without separately shared evidence.

## Cleanup and automation

Disposable exploration user deleted through the existing admin API helper; temporary auth files deleted. UI functional tests exercise verified desktop behavior. The known mobile layout defect is not encoded as an expected failure or screenshot baseline. Recheck 360/375px after the application fix, including long names and email addresses.

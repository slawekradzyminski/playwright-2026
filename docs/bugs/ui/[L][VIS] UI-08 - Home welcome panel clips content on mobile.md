# [VIS] Home — welcome panel clips content on mobile

**ID:** UI-08  
**Status:** Open  
**Category:** VIS  
**Observed on:** 2026-09-11

## Environment and preconditions

- URL: http://localhost:8081/; app build unknown; test revision c8c873feed2f163c3eb3c15b8c0c6346770642eb.
- Chromium 152.0.7977.84 on macOS, resized desktop context at 414 × 896 CSS pixels. Default desktop DPR/zoom, no touch emulation or throttling, normal browser cache.
- Disposable ROLE_CLIENT account, first name Header, email header_explore_20260911@example.com. Signed in through the UI after API registration.

## Steps to reproduce

1. Sign in and open Home.
2. Resize the viewport to 414 × 896.
3. Inspect the welcome description, email and right edge of the shortcut cards, then repeat after layout has settled.

## Actual result and evidence

The welcome description, email and shortcut descriptions extend beyond the welcome panel's right edge and are clipped. Reproduced in two captures separated by subsequent CLI calls; this persisted beyond the initial resize. The welcome section measures 380 px client width and 456 px scroll width. The document itself has no horizontal overflow, so the hidden content cannot be revealed by normal horizontal page scrolling. At 768 px the email wraps and the cards fit; at 1920 px the content fits.

![Mobile welcome panel clipping](../../../exploration/ui/home-header-2026-09-11/mobile-confirm.png)

The right edge cuts off the email and card descriptions. Essential dimensions above remain available when the local ignored screenshot is absent.

## Expected result and basis

Responsive content should wrap or reflow within the panel so the displayed account information and navigation descriptions can be read. This is visible content loss, rather than a preference about visual style. Exact CSS cause was not established.

## Impact assessment

Mobile-width users cannot read complete text in the welcome area. Shortcut labels remain identifiable and desktop navigation works; core navigation is not shown to be blocked. A wider viewport is a workaround.

## Severity rationale and decision

The mobile welcome panel hides parts of the email and descriptions, but shortcut labels remain identifiable and desktop navigation works. A wider viewport reveals the content. The observed consequence is bounded readability loss rather than blocked navigation.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Acceptance criteria and retest

- [ ] Welcome description, email and shortcut descriptions remain readable at 414 × 896.
- [ ] Check the same content at 768 × 1024 and 1920 × 1080.
- [ ] Verify shortcut navigation and keyboard focus after the layout change.
- [ ] Manual responsive review is required; automated UI paths are desktop-only by project policy.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

The disposable exploration account is deleted through the API at session close. No injected failures, real-device, screen-reader or performance audit was performed. This report concerns clipping only, not account authorization or destination-screen behavior.

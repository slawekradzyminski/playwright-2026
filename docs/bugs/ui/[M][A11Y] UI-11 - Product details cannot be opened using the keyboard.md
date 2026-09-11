# [A11Y] Products — product detail navigation is unavailable by keyboard

**ID:** UI-11  
**Status:** Open  
**Category:** A11Y  
**Observed on:** 2026-09-11

## Environment and preconditions

- URL: http://localhost:8081/products; deployed build unknown; test repository d6c4f61.
- macOS, Chrome 152, desktop 1920 × 1080; normal zoom, no throttling, desktop browser context. Exploration began headed and continued headless at the user's request.
- Disposable ROLE_CLIENT account; seeded catalog of eight products. No shared account data changed.

## Steps to reproduce

1. Open the catalog as a signed-in client.
2. Focus the Sort by control and press Tab through the first product's controls.
3. Try to reach and activate the product title or card using the keyboard.
4. Compare with clicking the Apple Watch Series 7 title.

## Actual result and evidence

Tab moves from sorting directly to the first card's minus button. The card is a DIV with tabIndex -1, no role, and no descendant links. All eight product cards have the same non-interactive structure. Repeated inspection after return from detail confirmed the same behavior. Clicking the title opens /products/7 and renders Apple Watch detail; that navigation has no keyboard-focusable equivalent in the card.

![Desktop catalog](../../../exploration/ui/products-2026-09-11/desktop.png)

The title/image area provides pointer navigation; only quantity/cart controls enter the keyboard sequence. URL transition alone was not used to establish successful detail loading: a subsequent snapshot confirmed the detail image and Back to Products link.

## Expected result and basis

Expose product detail navigation as a named, keyboard-operable link, preferably the product title. This follows keyboard operability and semantic-control principles. Keep quantity/cart actions independent of navigation.

## Impact assessment

Keyboard-only users cannot open product details directly from the catalog. They can still use the visible quantity/cart buttons; mouse users can open details. Manually entering a known detail URL is not a discoverable catalog workaround. No screen-reader session was performed.

## Severity rationale and decision

An advertised catalog action is inaccessible to keyboard users across all cards, although cart actions and pointer navigation remain usable. This materially impairs access to product information without blocking all purchasing actions.

**Severity:** M

## Acceptance criteria and retest

- [ ] Each product has a named link reachable with Tab and activated with Enter.
- [ ] Activation renders the matching product details.
- [ ] Quantity and cart actions neither navigate nor trigger extra cart mutations.
- [ ] Check desktop keyboard behavior and responsive layout after the change.
- [ ] Add a keyboard regression after fixing; `tests/ui/products.ui.spec.ts` currently covers successful pointer navigation and catalog/cart behavior. Its passing tests do not verify this defect.

**Retested on/build:** Pending  
**Retest evidence:** Pending

## Cleanup and limits

Disposable account/cart used for investigation; cart confirmed empty and account deleted through the right-to-be-forgotten API (204). No real-device or screen-reader testing. CLI instrumentation failures were tooling problems and are not reported as application defects.

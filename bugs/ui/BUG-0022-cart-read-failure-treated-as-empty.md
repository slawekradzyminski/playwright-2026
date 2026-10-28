# BUG-0022: Failed cart reads silently become an empty-cart state

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Products] Failed cart reads silently become an empty-cart state |
| Issue Type | Bug |
| Priority | High |
| Component/s | Product catalog |
| Labels | ui, functional, usability, products |
| Environment | http://localhost:8081/products; frontend 3.9.1; backend 3.9.4; disposable client and owned products |
| Browser / viewport | Chromium; 1920 × 1080 unless otherwise stated |
| Source revision | Deployed frontend image label: 607fe6be7f3be33ed2e7f47d78957b18b63cb81b; relevant files identical at local 7392a3a935b373f3160c5a3ae4162c5b2f310624 |
| Verification date | 2026-10-28 |
| Report status | New |
| Jira | Not created |

## Description

When the cart cannot be read, product cards silently assume no item exists. They offer a fresh “Add to Cart” action instead of warning that the existing quantity is unknown. A real subsequent add increments the existing quantity, while the page still hides it. This can leave users with unintended quantities.

## Steps to reproduce

1. Use a disposable client and a product with stock at least 3; add 2 units through `/products`.
2. Intercept only browser `GET /api/v1/cart` and return HTTP 500; keep product and mutation requests real.
3. Reload `/products` and find that product.
4. Click the displayed “Add to Cart” at quantity 1.
5. Read the real cart after removing the GET interception, or reload once connectivity recovers.

## Expected result

A failed or pending cart read is distinguishable from a successfully loaded empty cart. The page gives recovery feedback and avoids presenting an unknown existing item as absent. After mutations, the saved quantity is reconciled and communicated.

## Actual result

The card shows quantity 1, “Add to Cart”, no “in cart” indicator and no visible error. Clicking adds one unit to the existing two. Success feedback states “1 × UXProbe Alpha added to your cart”; the saved cart contains 3 units, while the intercepted read keeps the current total hidden.

## Evidence

Browser fault injection supplied the initial/read-after-write HTTP 500 responses; the cart mutation and final verification used the real backend. Observed states:

| State | Observed result |
| --- | --- |
| Before fault | Product 432, quantity 2 |
| After failed GET | `Add to Cart`; displayed quantity 1; no cart indicator or visible error |
| After real POST | Success notification for one added unit |
| Real cart after removing fault | One item: quantity 3; totalItems 3; totalPrice 29.97 |

The owned product and client were removed after exploration. This is a frontend failure-handling defect, not evidence of a spontaneous backend outage. Backend additive POST behavior matches `CartService.addToCart`.

### GraphQL product-detail reproduction, 2026-10-28

The same failure also occurs on `/products/:id` in GraphQL mode. On the same gateway/image versions, using a new owned client/product and Chromium at 1920 × 1080, the real cart contained one unit at 12.50. Intercepting only the `query Cart` operation with HTTP 200 and `{data:{cart:null},errors:[{message:"Injected cart read failure",extensions:{code:"FORBIDDEN"}}]}` left the product loaded and displayed **Add to Cart** rather than its existing quantity/update state. Login remained active. No additional add was submitted in this fault scenario.

The standalone `/cart` screen showed its explicit error state for the same injected response and recovered through Try again after interception was removed. The problem is therefore the product surface's handling of unknown cart state, not the adapter failing to reject execution errors. The new owned accounts/product were deleted successfully after exploration.

## Root cause

[ProductCard.tsx](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/products/ProductCard.tsx#L23) reads only `data` from the cart query and ignores loading/error state. `cartItem?.quantity || 0` maps unavailable data to zero; the handler chooses POST rather than updating an existing item based on that value.

[ProductDetails.tsx](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/products/ProductDetails.tsx#L31-L39) uses the same data-only query and zero fallback. These lines match the reviewed frontend reference `7392a3a935b373f3160c5a3ae4162c5b2f310624`.

## Acceptance criteria

- Unknown, failed and genuinely empty cart states remain distinct.
- Failed reads expose recovery and do not silently present known-cart actions based on zero.
- Recovery reconciles the real saved quantity without duplicate or unintended additions.
- Add a regression covering a prepopulated cart with a failed read and subsequent recovery.
- Cover catalog and product details, including GraphQL HTTP-200 execution errors; keep standalone cart error/retry behavior working.

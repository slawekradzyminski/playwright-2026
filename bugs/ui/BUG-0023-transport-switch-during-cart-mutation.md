# BUG-0023: Transport switching reloads the page during a pending cart mutation

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Products] Transport switching reloads the page during a pending cart mutation |
| Issue Type | Bug |
| Priority | Medium |
| Component/s | Product catalog |
| Labels | ui, functional, products |
| Environment | http://localhost:8081/products; frontend 3.9.1; backend 3.9.4; disposable client and owned products |
| Browser / viewport | Chromium; 1920 × 1080 unless otherwise stated |
| Source revision | Deployed frontend image label: 607fe6be7f3be33ed2e7f47d78957b18b63cb81b; relevant files identical at local 7392a3a935b373f3160c5a3ae4162c5b2f310624 |
| Verification date | 2026-10-28 |
| Report status | New |
| Jira | Not created |

## Description

The Shop API selector is intended to prevent transport changes while mutations are pending. A catalog cart mutation bypasses that guard, allowing the user to reload away from the operation and lose its feedback. Whether a request already accepted by the server commits is timing-dependent; no server data-loss claim is made.

## Steps to reproduce

1. Sign in as a disposable client, open `/products` in REST mode and find an in-stock product.
2. Hold its browser `POST /api/v1/cart/items` request using a route gate.
3. Click “Add to Cart” and leave the request pending.
4. Change Shop API to GraphQL.

## Expected result

The selector and its click-time guard prevent switching/reloading until the catalog cart mutation settles, matching the explicit guard in the transport implementation.

## Actual result

The card's Add button is disabled, but the Shop API selector remains enabled. Selecting GraphQL reloads the page while the held add is unresolved.

## Evidence

Runtime probe returned `addDisabled: true`, `selectorEnabled: true`, then observed navigation/reload and `transport: graphql` before releasing the held request. The probe deliberately aborted that held request afterward; it did not submit it to the backend and does not establish the outcome of a server-accepted request. Separate real GraphQL add/remove journeys succeeded.

### GraphQL product-detail reproduction, 2026-10-28

The same pending-write guard gap was confirmed on `/products/:id` in GraphQL mode, using a new owned client/product, the same gateway/images and Chromium at 1920 × 1080. After a real GraphQL add and saved-cart read, a route gate held only `mutation UpdateCartItem` before reaching the server. The detail action was disabled, while `commerce-transport` remained enabled (`actionDisabled: true`, `selectorEnabled: true`). The held request was then aborted; no switch or server-accepted write was attempted in this additional reproduction. Owned data was deleted after exploration.

## Root cause

[CommerceTransportSelector.tsx](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/layout/CommerceTransportSelector.tsx) uses `useIsMutating()` and `queryClient.isMutating()` for the guard. [ProductCard.tsx](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/products/ProductCard.tsx#L49) performs cart writes through direct API calls plus local `isLoading`, which do not register in the React Query mutation cache. [commerceTransport.ts](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/lib/commerceTransport.ts) explicitly rejects switches when pendingMutations is positive.

[ProductDetails.tsx](https://github.com/slawekradzyminski/vite-react-frontend/blob/607fe6be7f3be33ed2e7f47d78957b18b63cb81b/src/components/products/ProductDetails.tsx#L49-L67) also calls cart writes directly and tracks local loading flags. Relevant source matches reference `7392a3a935b373f3160c5a3ae4162c5b2f310624`. CartItem and CartSummary contain similar direct-call patterns; their pending-switch runtime behavior was not rechecked in this reproduction.

## Acceptance criteria

- Catalog add/update/remove operations participate in the pending-mutation guard.
- The selector is disabled and the click-time guard rejects changes while a write is pending.
- Switching works again after both success and failure.
- Add an integration regression using an actually pending product-card write.
- Include actually pending product-detail writes in GraphQL mode and audit the remaining cart write entry points for the same guard gap.

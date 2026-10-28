# BUG-0026: GraphQL money strings use an inconsistent decimal scale

| Jira field / metadata | Value |
| --- | --- |
| Summary | [GraphQL] The same amount is returned as "12.5", "12.50", "0" or "0.00" depending on the operation |
| Issue Type | Bug |
| Priority | Low |
| Component/s | Commerce GraphQL API |
| Labels | api, graphql, products, cart |
| Environment | `POST http://localhost:8081/api/v1/graphql`; backend image 3.9.4 (revision label `fd4c015434dd573f26bf8ff6691ff14611e2f247`), profile `local` |
| Browser / viewport | N/A |
| Source revision | Analysis at [`3152f6cc331940c6d89eb6eff8e4b5a7b820079e`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e); GraphQL package identical to the running revision label |
| Verification date | 2026-10-28 |
| Report status | New |
| Jira | Not created |

## Description

The SDL describes money as "an exact decimal string" and the guide's example is `"39.98"`. Reads of stored amounts use two decimals, but some responses echo the scale of an unsaved value. A client comparing strings, caching by value or rendering the string directly sees one product at two different prices, and an empty cart shows a differently formatted zero than a cart with items.

## Steps to reproduce

1. As the administrator, run `createProduct(input: { name: "Scale probe", description: "d", price: "12.5", stockQuantity: 3, category: "Probe" }) { id price }`.
2. Read the same product: `product(id: "<id>") { price }`.
3. As a disposable customer with an empty cart, run `cart { totalPrice }`; then add one unit of any product and repeat.

## Expected result

Every money field uses the same representation for the same value — the stored scale of two decimals (`"12.50"`, `"0.00"`) — regardless of whether it is a mutation result or a later read.

## Actual result

| Operation | Value sent / stored | Returned |
| --- | --- | --- |
| `createProduct` response | `"12.5"` | `"12.5"` |
| `product` read of the same product | stored 12.50 | `"12.50"` |
| `cart.totalPrice`, empty cart | — | `"0"` |
| `cart.totalPrice`, one unit at 12.50 | — | `"12.50"` |

## Evidence

Runtime probes on 2026-10-28 with a disposable customer and owned products (all deleted afterwards; user and product deletions returned 204). Both rows reproduced on each attempt (2 attempts). The automated suite compares money in integer minor units, so it neither depends on nor asserts the inconsistent scale.

## Root cause

[`CommerceViews.money`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/graphql/CommerceViews.java#L21-L23) returns `BigDecimal.toPlainString()` without normalizing the scale. [`ProductService.createProduct`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/ProductService.java#L75-L79) maps the saved entity before it is reloaded, so the input scale is returned. An empty cart total is [`BigDecimal.ZERO`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/graphql/CommerceViews.java#L53), which has scale 0.

## Suggested fix

Format all GraphQL money with `setScale(2, RoundingMode.UNNECESSARY)` in `CommerceViews.money`, so an unexpected third decimal fails loudly instead of being rounded.

## Acceptance criteria

- `createProduct`, `updateProduct`, cart, order and inventory-related money fields always return two decimals.
- An empty cart returns `totalPrice: "0.00"`.
- A backend GraphQL test covers a create with a one-decimal input and an empty cart total.

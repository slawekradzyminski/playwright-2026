# BUG-0002: Orders are charged at a stale cart price after a product price change

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Cart][Orders] Cart line price is a snapshot that is refreshed only when the line changes; orders charge that snapshot |
| Issue Type | Bug |
| Priority | High (proposed) |
| Component/s | API / Cart, API / Orders |
| Labels | api, cart, orders, pricing |
| Environment | Local stack http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | [`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e) |
| Verification date | 2026-10-26 |
| Report status | Needs confirmation |
| Jira | To be added once the issue is created |

## Description

Each cart line stores the product price from when it was last modified. A
product price change does not reach existing carts. The order is then created
with the stored price, so customers can buy at an outdated price, higher or
lower. Any later change to the line re-prices the **whole** line, including
units added earlier. The amount a customer pays therefore depends on when they
last touched the cart, not on a pricing rule.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Add 2 units at 10.00; admin sets price 20.00; `GET /api/v1/cart` | Total by the agreed rule (40.00 if the current price applies) | `totalPrice: 20.00` |
| 2 | Same cart; `POST /api/v1/orders` | Order priced by the agreed rule | `201`, `unitPrice: 10.00`, `totalAmount: 20.00` |
| 3 | Add 2 at 10.00; price 20.00; add 1 more | Consistent with row 1 | `quantity: 3`, `totalPrice: 60.00` (earlier units re-priced) |

## Root cause

- [`CartItemEntity.price`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/entity/CartItemEntity.java#L32)
  is a snapshot (comment: "price at the time of adding to cart").
- It is overwritten with the current price whenever the line changes:
  [`CartService` L64](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/CartService.java#L64)
  (update) and [L100](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/CartService.java#L100)
  (add).
- Cart totals ([`calculateTotalPrice`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/CartService.java#L111))
  and orders ([`OrderService` L136](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/OrderService.java#L136))
  read the snapshot and never compare it with the current product price.

## Steps to reproduce

1. As admin, create a product with `price: 10.00`, `stockQuantity: 10`.
2. As a client, `POST /api/v1/cart/items` `{"productId": <id>, "quantity": 2}`.
3. As admin, `PUT /api/v1/products/<id>` `{"price": 20.00}`.
4. As the client, `GET /api/v1/cart`, then `POST /api/v1/orders` with a valid
   address (e.g. `{"street": "1 Main St", "city": "Krakow", "state": "MP", "zipCode": "30-001", "country": "Poland"}`).

## Evidence

Row 1 and row 3 were reproduced on 2026-10-26 (plus two exploratory runs with
other prices showing the same pattern). Row 2 was verified once on
2026-10-26 after the code review:

```text
POST /api/v1/orders <- 201 {"items":[{"quantity":2,"unitPrice":10.00,"totalPrice":20.00}],"totalAmount":20.00,"status":"PENDING"}
```

Test users, orders and products were deleted afterwards.

## Suggested fix

Decide the pricing rule with the product owner (see [QUESTIONS](../QUESTIONS.md)).
Then either compute cart and order prices from the current product price, or
keep a per-unit snapshot and re-validate it at checkout, so that line updates
don't silently re-price earlier units.

## Acceptance criteria

- After a price change, cart totals and the created order follow the agreed
  rule consistently (rows 1–3).
- Carts and orders for products whose price did not change are unaffected.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).

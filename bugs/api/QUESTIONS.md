# Open questions for product and project

Findings that need a decision before they can become a bug, a fix or an
accepted behavior. Each item names who should decide and what it blocks.
Backend revision for code references:
[`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e).
Runtime observations: local stack, backend image 3.9.4, 2026-10-26.

## Product decisions

| # | Question | Observed | Blocks |
| --- | --- | --- | --- |
| Q1 | Which price applies to items in a cart: the current product price, or the price when the unit was added (and is checkout re-validated)? | Snapshot refreshed only when the line changes; orders charge the snapshot | [BUG-0002](functional/BUG-0002-cart-and-order-use-stale-price.md) |
| Q2 | Are usernames case-insensitive, and which characters are allowed? (SSO already enforces lowercase `[a-z0-9._-]`.) | `Mixed-x` and `mixed-x` are separate accounts | [BUG-0001](functional/BUG-0001-identity-fields-not-canonicalized.md) row 2 |
| Q3 | What is the password policy beyond length (character classes, common-password list)? | `12345678` and `password` are accepted | Future validation work; whitespace-only passwords are already in [BUG-0003](functional/BUG-0003-request-validation-gaps.md) |
| Q4 | How strict should email validation be? | `a@b` (no top-level domain) is accepted | — |
| Q5 | When stock drops below the quantity in a cart, may the user still reduce the quantity to any value above the new stock? | `PUT` 4 → 3 with stock 2 returns `409`; only ≤ stock or removal works | — |
| Q6 | Should carts reserve stock? | Two users can each hold the full stock; the check happens per cart and at checkout | — |
| Q7 | What happens to a product that is in someone's cart when an admin deletes it? | `409 Product is referenced by existing data` until every cart drops it; also confirmed for pending and cancelled order references on 2026-10-26 | Admin product management |
| Q8 | When a user is deleted, should their orders be kept (accounting) and should stock of open orders be restored? | Code deletes orders without restoring stock ([`UserService.forget`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/UserService.java#L108-L111)); runtime-confirmed on 2026-10-27: owned product stock 9 → 7 on checkout, account DELETE 204, order GET as admin 404, stock still 7; owned product cleanup 204 | — |
| Q13 | Should product names be unique or trimmed/canonicalized, and should categories be normalized? Product owner should decide before adding such assertions. | Product POST accepts duplicate names; writes preserve whitespace/case. Catalogue product identity is the numeric ID; no uniqueness rule is documented. Verified 2026-10-26, backend 3.9.4 (`local`). | Product-name/category policy tests |

## Security and environment decisions

| # | Question | Observed | Blocks |
| --- | --- | --- | --- |
| Q9 | Should login rate limiting be on in the training environments? It is implemented but off by default (`SECURITY_RATE_LIMIT_ENABLED:false` in [`application.yml`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/resources/application.yml#L80-L81)); is it enabled on the public `aitesters` deployment? | 100 failed logins in a row on the local stack, no throttling | — |
| Q10 | If enabled, is the per-username login limit (10 per 15 min) acceptable, given it lets anyone lock a known user out? | Code only ([`RateLimitProperties`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/security/ratelimit/RateLimitProperties.java)) | Q9 |
| Q11 | Is the local Docker stack meant to run with the `local` profile? It returns the password reset token in the forgot-password response (`expose-token-in-response: true`), so anyone who can reach the stack can reset any password, including the admin's. The repository's `docker-compose.yml` uses `docker,demo`, where exposure is off. | Running container has `SPRING_PROFILES_ACTIVE=local`; takeover of a test account confirmed | Must never apply to shared environments |
| Q12 | Does the frontend escape user-provided names? The API stores and returns `<script>alert(1)</script>` as is (normal for an API, but the UI must encode it). | Signup accepted the value; UI not checked | UI exploration |

## Decisions from the 2026-10-27 increment

Runtime: gateway `http://localhost:8081`, backend 3.9.4, image revision
`fd4c015434dd573f26bf8ff6691ff14611e2f247`, profile `local`.
Only disposable accounts, products and chosen traffic sessions were used.

| # | Question / decision owner | Runtime-confirmed observation and source | Blocks |
| --- | --- | --- | --- |
| Q14 | Must traffic credential masking be enabled locally? Security/project owner. | Own traffic record includes the bearer header. Masking explicitly defaults off in [application.yml](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/resources/application.yml#L179-L182); [sanitizer](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/traffic/TrafficDataSanitizer.java#L60-L69) masks only when enabled. Credential values omitted. | Masking assertions/configuration changes; no protection switch was changed. |
| Q15 | Is a traffic session ID a shared capability across accounts, or must it bind to the authenticated principal? Security/product owner. | With two disposable accounts and one chosen session, B read A's captured record (`200`). [Detail lookup](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/controller/TrafficController.java#L127-L135) filters session/correlation, not principal. Both accounts deleted. | Cross-account denial assertions; current suite tests isolation between distinct sessions only. |
| Q16 | Should the user directory be available to all authenticated users or ADMIN only? Product/security owner. | Disposable ROLE_CLIENT received `200` with directory profiles. Backend README says ADMIN only; live OpenAPI says authenticated callers. See [BUG-0008](documentation/BUG-0008-openapi-contract-mismatches.md) row 13. | Client directory-access policy assertions; suite uses admin for directory success. |
| Q17 | Should reopening a CANCELLED order deduct stock again or be forbidden? Commerce owner. | After checkout 9 → 7 and cancellation → 9, admin PUT PENDING succeeded while stock stayed 9; another cancellation succeeded and stock stayed 9. [OrderService](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/service/OrderService.java#L88-L98) explicitly assigns non-CANCELLED statuses directly; inventory remains RESTORED. This agrees with the documented direct-assignment behavior, but its business meaning needs a decision. | Reactivation inventory assertions; no known-question behavior is asserted as a required rule. |

## GraphQL decisions, 2026-10-28

Runtime: gateway `http://localhost:8081`, backend 3.9.4, image revision label
`fd4c015434dd573f26bf8ff6691ff14611e2f247`, profile `local`, endpoint `POST /api/v1/graphql`.
Only disposable accounts and owned products/orders were used and deleted afterwards.

| # | Question / decision owner | Runtime-confirmed observation and source | Blocks |
| --- | --- | --- | --- |
| Q18 | Should a customer be able to tell that another customer's order ID exists? Security/product owner. | `order(id)` for a foreign order returns `NOT_FOUND`, but `cancelOrder(id)` for the same order returns `FORBIDDEN` and a missing ID returns `NOT_FOUND`, so cancellation distinguishes existing foreign orders. REST behaves the same (`403` vs `404`). [OrderService.cancelOrder](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/OrderService.java#L97-L106) checks ownership after the lookup. | The suite asserts the current documented codes; a decision to hide existence would change both REST and GraphQL tests. |
| Q19 | Which `Accept` media types must GraphQL clients be able to use? API owner. | `application/json` returns `application/json`; `application/graphql-response+json` returns that type with the same body. Other types were not explored. | Exact assertions beyond these two media types. |

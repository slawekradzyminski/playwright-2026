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
| Q8 | When a user is deleted, should their orders be kept (accounting) and should stock of open orders be restored? | Code deletes orders without restoring stock ([`UserService.forget`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/UserService.java#L108-L111)); found in code, not verified at runtime | — |
| Q13 | Should product names be unique or trimmed/canonicalized, and should categories be normalized? Product owner should decide before adding such assertions. | Product POST accepts duplicate names; writes preserve whitespace/case. Catalogue product identity is the numeric ID; no uniqueness rule is documented. Verified 2026-10-26, backend 3.9.4 (`local`). | Product-name/category policy tests |

## Security and environment decisions

| # | Question | Observed | Blocks |
| --- | --- | --- | --- |
| Q9 | Should login rate limiting be on in the training environments? It is implemented but off by default (`SECURITY_RATE_LIMIT_ENABLED:false` in [`application.yml`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/resources/application.yml#L80-L81)); is it enabled on the public `aitesters` deployment? | 100 failed logins in a row on the local stack, no throttling | — |
| Q10 | If enabled, is the per-username login limit (10 per 15 min) acceptable, given it lets anyone lock a known user out? | Code only ([`RateLimitProperties`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/security/ratelimit/RateLimitProperties.java)) | Q9 |
| Q11 | Is the local Docker stack meant to run with the `local` profile? It returns the password reset token in the forgot-password response (`expose-token-in-response: true`), so anyone who can reach the stack can reset any password, including the admin's. The repository's `docker-compose.yml` uses `docker,demo`, where exposure is off. | Running container has `SPRING_PROFILES_ACTIVE=local`; takeover of a test account confirmed | Must never apply to shared environments |
| Q12 | Does the frontend escape user-provided names? The API stores and returns `<script>alert(1)</script>` as is (normal for an API, but the UI must encode it). | Signup accepted the value; UI not checked | UI exploration |

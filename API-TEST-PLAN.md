# API test plan

REST endpoint = HTTP method + route declared by backend REST controllers under `/api/v1`. An endpoint is covered only when it is the subject of at least one explicit Playwright API test; fixture setup and cleanup do not count. This measures endpoint presence, not scenario completeness or passing results. GraphQL has a separate field inventory below.

**31 / 55 covered (56.4%); 24 remaining (43.6%).**

| Area | Covered / total | Remaining |
| --- | ---: | ---: |
| Users | 7 / 24 | 17 |
| Products | 5 / 5 | 0 |
| Cart | 5 / 5 | 0 |
| Orders | 6 / 6 | 0 |
| Admin inventory | 0 / 4 | 4 |
| Ollama | 4 / 4 | 0 |
| Traffic | 3 / 3 | 0 |
| Local email outbox | 0 / 2 | 2 |
| Email | 0 / 1 | 1 |
| QR | 1 / 1 | 0 |

All paths below have the `/api/v1` prefix.

Covered users: `POST /users/signin`, `POST /users/signup`, `GET /users`, `GET, PUT, DELETE /users/{username}`, `GET /users/me`.
Covered orders: `POST, GET /orders`, `GET /orders/{id}`, `PUT /orders/{id}/status`, `POST /orders/{id}/cancel`, `GET /orders/admin`.
Covered traffic: `GET /traffic/info`, `/traffic/logs`, `/traffic/logs/{correlationId}`.
Products, cart, Ollama and QR have explicit tests for every endpoint in their areas.

Remaining priorities:

1. **Admin inventory (4):** `GET /admin/inventory`, `GET /admin/inventory/{productId}`, `POST /admin/inventory/{productId}/adjustments`, `GET /admin/inventory/{productId}/movements`.
2. **Users and authentication (17):** `DELETE /users/{username}/right-to-be-forgotten`, `GET /users/me/email-events`, `POST /users/refresh`, `POST /users/logout`, `POST /users/password/forgot`, `POST /users/password/reset`, `POST /users/sso/exchange`; 2FA: `POST /users/signin/2fa`, `GET /users/2fa/status`, `POST /users/2fa/setup`, `/confirm`, `/recovery-codes`, `/disable` (last three under `/users/2fa`); prompts: `GET, PUT /users/chat-system-prompt` and `/users/tool-system-prompt`.
3. **Other integrations (3):** `POST /email`; `GET, DELETE /local/email/outbox`.

For each group, inspect backend and live contract, explore with curl, then add representative success, validation and authorization tests as applicable. Priorities are a proposed order, not a claim that every endpoint is in the deployed profile.

Inventory basis: backend reference commit `3152f6cc331940c6d89eb6eff8e4b5a7b820079e`, reconciled with the local OpenAPI contract (55 endpoints). Coverage counts explicit test subjects, not passing tests or complete scenario coverage.

## GraphQL inventory

**20 / 20 root fields covered (9 queries, 11 mutations); done.** Counted from the backend SDL at the same reference commit, reconciled with authenticated introspection, separately from REST. Specs live in `tests/api/graphql/` as `<domain>-queries` and `<domain>-mutations` for products, cart, orders and inventory, plus `transport` for HTTP, document, limit and execution checks.

Remaining depth belongs in backend code-level tests rather than this suite: full input partitions per field, concurrency and query counts, and the money scale fix ([BUG-0026](bugs/api/functional/BUG-0026-graphql-money-scale-inconsistent.md)).

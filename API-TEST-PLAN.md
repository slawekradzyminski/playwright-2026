# API test plan

Snapshot: 2026-10-27. Endpoint = HTTP method + route declared by backend REST controllers under `/api/v1`. An endpoint is covered only when it is the subject of at least one explicit Playwright API test; fixture setup and cleanup do not count. This measures endpoint presence, not scenario completeness or passing results.

**17 / 55 covered (30.9%); 38 remaining (69.1%).**

| Area | Covered / total | Remaining |
| --- | ---: | ---: |
| Users | 2 / 24 | 22 |
| Products | 5 / 5 | 0 |
| Cart | 5 / 5 | 0 |
| Orders | 0 / 6 | 6 |
| Admin inventory | 0 / 4 | 4 |
| Ollama | 4 / 4 | 0 |
| Traffic | 0 / 3 | 3 |
| Local email outbox | 0 / 2 | 2 |
| Email | 0 / 1 | 1 |
| QR | 1 / 1 | 0 |

Covered users: `POST /users/signin`, `POST /users/signup`. Covered QR: `POST /qr/create`. All paths below have the `/api/v1` prefix.

1. **Orders and inventory (10):** orders: `POST, GET /orders`, `GET /orders/{id}`, `PUT /orders/{id}/status`, `POST /orders/{id}/cancel`, `GET /orders/admin`; inventory: `GET /admin/inventory`, `GET /admin/inventory/{productId}`, `POST /admin/inventory/{productId}/adjustments`, `GET /admin/inventory/{productId}/movements`.
2. **Users and authentication (22):** `GET /users`, `GET, PUT, DELETE /users/{username}`, `DELETE /users/{username}/right-to-be-forgotten`, `GET /users/me`, `GET /users/me/email-events`, `POST /users/refresh`, `POST /users/logout`, `POST /users/password/forgot`, `POST /users/password/reset`, `POST /users/sso/exchange`; 2FA: `POST /users/signin/2fa`, `GET /users/2fa/status`, `POST /users/2fa/setup`, `/confirm`, `/recovery-codes`, `/disable` (last three under `/users/2fa`); prompts: `GET, PUT /users/chat-system-prompt` and `/users/tool-system-prompt`.
3. **Other integrations (6):** `POST /email`; `GET, DELETE /local/email/outbox`; `GET /traffic/info`, `/traffic/logs`, `/traffic/logs/{correlationId}`.

For each group, inspect backend and live contract, explore with curl, then add representative success, validation and authorization tests as applicable. Priorities are a proposed order, not a claim that every endpoint is in the deployed profile.

Inventory: backend reference commit `3152f6cc331940c6d89eb6eff8e4b5a7b820079e`; the local OpenAPI contract lists the same 55 endpoints. Local checks used backend 3.9.4 with the `local` and `graphql` profiles. Coverage counts endpoints with explicit tests, not passing tests or complete scenario coverage.

# API test plan

Snapshot: 2026-10-27. Endpoint = HTTP method + route declared by backend REST controllers under `/api/v1`. An endpoint is covered only when it is the subject of at least one explicit Playwright API test; fixture setup and cleanup do not count. This measures endpoint presence, not scenario completeness or passing results.

**13 / 55 covered (23.6%); 42 remaining (76.4%).**

| Area | Covered / total | Remaining |
| --- | ---: | ---: |
| Users | 2 / 24 | 22 |
| Products | 5 / 5 | 0 |
| Cart | 5 / 5 | 0 |
| Orders | 0 / 6 | 6 |
| Admin inventory | 0 / 4 | 4 |
| Ollama | 0 / 4 | 4 |
| Traffic | 0 / 3 | 3 |
| Local email outbox | 0 / 2 | 2 |
| Email | 0 / 1 | 1 |
| QR | 1 / 1 | 0 |

Covered users: `POST /users/signin`, `POST /users/signup`. Covered QR: `POST /qr/create`. All paths below have the `/api/v1` prefix.

1. **Orders and inventory (10):** orders: `POST, GET /orders`, `GET /orders/{id}`, `PUT /orders/{id}/status`, `POST /orders/{id}/cancel`, `GET /orders/admin`; inventory: `GET /admin/inventory`, `GET /admin/inventory/{productId}`, `POST /admin/inventory/{productId}/adjustments`, `GET /admin/inventory/{productId}/movements`.
2. **Users and authentication (22):** `GET /users`, `GET, PUT, DELETE /users/{username}`, `DELETE /users/{username}/right-to-be-forgotten`, `GET /users/me`, `GET /users/me/email-events`, `POST /users/refresh`, `POST /users/logout`, `POST /users/password/forgot`, `POST /users/password/reset`, `POST /users/sso/exchange`; 2FA: `POST /users/signin/2fa`, `GET /users/2fa/status`, `POST /users/2fa/setup`, `/confirm`, `/recovery-codes`, `/disable` (last three under `/users/2fa`); prompts: `GET, PUT /users/chat-system-prompt` and `/users/tool-system-prompt`.
3. **Other integrations (10):** `POST /email`; `GET, DELETE /local/email/outbox`; `GET /traffic/info`, `/traffic/logs`, `/traffic/logs/{correlationId}`; `POST /ollama/generate`, `/ollama/chat`, `/ollama/chat/tools`, `GET /ollama/chat/tools/definitions`.

For each group, inspect backend and live contract, explore with curl, then add representative success, validation and authorization tests as applicable. Priorities are a proposed order, not a claim that every endpoint is in the deployed profile.

Inventory source: backend reference commit `3152f6cc331940c6d89eb6eff8e4b5a7b820079e`. The local gateway OpenAPI document was checked on 2026-10-27 and lists the same 55 REST operations under `/api/v1`. The previous QR exploration observed backend image 3.9.4, image revision label `fd4c015434dd573f26bf8ff6691ff14611e2f247`, profile `local`; these runtime details were not rechecked for this plan update. The QR spec passed its three tests on 2026-10-27; the full API suite was not run for this update. The endpoint count describes explicit tests, not their current pass status or the completeness of their scenarios. Known QR issues and pending regression coverage are recorded in [BUG-0011](bugs/functional/BUG-0011-qr-unicode-corruption.md) and [BUG-0012](bugs/functional/BUG-0012-qr-capacity-error.md).

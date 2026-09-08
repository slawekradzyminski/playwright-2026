# BUG-022: Cart lookup with a stale deleted-user token returns 500

- Type: Functional
- Status: Suspected
- Proposed severity: Medium — a client retaining a valid token after account deletion receives a server error instead of a controlled authentication or not-found response.
- Endpoint: `GET /api/v1/cart`
- Environment: 2026-09-08, configured local gateway (base URL omitted), deployed backend `3.7.16`, OCI revision `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`; account source revision differs as recorded in the exploration report.

## Preconditions

A disposable customer account owned a disposable cart item and order. The account was deleted through its right-to-be-forgotten endpoint. No shared account, product, or outbox was changed.

## Reproduction

```text
DELETE /api/v1/users/<disposable-username>/right-to-be-forgotten
Authorization: Bearer <token-issued-to-that-user>

GET /api/v1/cart
Authorization: Bearer <same-token>
```

## Expected

After account deletion, the stale token should receive a controlled response such as 401 or 404. The exact requirement is not specified; 500 is unexpected and should be clarified.

## Actual

The forget request returned 204 and the user profile/order readback confirmed deletion. The subsequent cart request returned 500 application/json. Supervisor independently reproduced the 500 after both deletion routes; the complete sanitized JSON body is retained in [request/response evidence](../exploration/2026-09-08-supervisor-accounts-evidence.json), entries `stale cart R03`.

## Evidence

Exploration report: [2026-09-08-accounts.md](../exploration/2026-09-08-accounts.md), case E16 and the focused accounts run. Reproduced once in the focused test run after a disposable cart/order setup. Supervisor terminal reproduction confirmed this once per deletion route (two additional reproductions), using newly created disposable products and customers.

## Impact

Clients that retain a token briefly after account deletion can trigger a server error when loading the cart. This can obscure the deletion state and create noisy server failures.

## Cleanup

The disposable account, cart, order, and product were cleaned up by the test fixture. Shared data and outbox were not touched.

## Follow-up and automation

Clarify the intended stale-token response, then fix and re-explore. The account forget test deliberately omits this unrelated failure from passing assertions and links this report in its comment.


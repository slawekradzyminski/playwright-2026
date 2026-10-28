# GraphQL API testing

The commerce GraphQL API is served at `POST /api/v1/graphql`. Use this reference
together with [exploration](exploration.md) and [automation](automation.md);
REST rules apply unless stated otherwise.

## Coverage

Count `Query.<field>` and `Mutation.<field>` from the backend SDL, reconciled
with authenticated introspection, separately from REST in `API-TEST-PLAN.md`.
Operation names, aliases, roles and transports are scenarios, not inventory
entries. The single GraphQL route never inflates the REST count.

## Exploration

Read the SDL (`src/main/resources/graphql-preview/commerce.graphqls`), the
`graphql` package (controllers, secured facades, error mapping, limits) and the
shared services. OpenAPI does not describe GraphQL. Reconcile the SDL with
authenticated introspection, one root type per request: repeated `__type` or
combined introspection triggers the BadFaithIntrospection guard and is not
evidence of missing support.

Probe each failure layer separately and record which one answered:

| Layer | Examples | Typical response |
| --- | --- | --- |
| HTTP/security | No/invalid token, malformed JSON, array batching, body > 64 KiB | Non-200 status with its own body |
| Document validation | Unknown field, invalid enum, missing/null required variable, unknown `operationName` | 200, `errors` with `classification: ValidationError`, no `data` |
| Resource limits | Depth > 20, complexity > 1000 (page sizes and aliases count) | 200, `ExecutionAborted`, nothing executed |
| Resolver/business | Invalid input, denied role/owner, missing entity, conflicts | 200, `errors[].extensions.code` with the field `path`, that field `null` |

Check partial results (aliases and fragments mixing allowed and denied fields)
and documents with several mutation roots, which commit independently. Verify
side effects with independent reads, including REST reads for parity.

## Automation

GraphQL specs live in `tests/api/graphql/` and are grouped by domain instead of
one file per route: `<domain>-queries.graphql.api.spec.ts` and
`<domain>-mutations.graphql.api.spec.ts` for products, cart, orders and
inventory, plus `transport.graphql.api.spec.ts` for HTTP, document, limit and
execution-semantics checks. Inside each file, describe each SDL field
(`Query.cart`, `Mutation.checkout`); order tests by success, then
`BAD_REQUEST`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, and end failure test
names with that code.

- Keep documents in `queries.ts` and `mutations.ts`, with shared field
  selections in `selections.ts`. Wire types live in `types/graphql.ts`; IDs are
  strings and money is a decimal string, so do not reuse REST DTOs.
- `http/graphql-client.ts` returns the raw response: `execute(...)` for
  documents and `post(...)` for envelope tests. Use `expectData`,
  `expectFieldError` and `expectValidationError` from `graphql-assertions.ts`.
- Use the `graphql` fixture (`GraphQlTestContext`) for a disposable customer,
  extra customers, owned products and saved-state checks (`expectSavedCart`,
  `savedProduct`, `expectStock`, `expectOrderStatus`), and `graphqlAdmin` for
  the administrator client. Call `trackCreatedProduct` before asserting a
  `createProduct` response, and `forgetProduct` after a confirmed delete.
- Compare money in integer minor units (`cents`) rather than strings. Keep
  page sizes small enough for the complexity limit when selecting full objects.
- Verify mutations with independent reads, using REST clients where parity
  matters, and assert unchanged state after rejected writes. In admin listings,
  find test-owned records instead of snapshotting shared data.

# Shop API (REST/GraphQL) UI scenarios

GraphQL storefront and admin scenarios live in `tests/ui/graphql/` with a focused
phone/tablet cases in `tests/ui/mobile/`. Import `test` or `adminCommerceTest` from
`tests/ui/graphql/graphql.fixtures.ts`. They start in GraphQL mode through the
`commerceTransport` fixture option, which seeds session storage once before the
first load and never overwrites a later switch. Selector scenarios set
`commerceTransport: undefined` and use `CommerceTransportSelector` from
`pages/components/`. Storage state does not carry session storage, so a new
context starts on the application default.

- Take page objects, the `shopApi` selector, `header` and `commerceTraffic`
  (commerce request observer) from fixtures, and the `shop` fixture for owned
  data and REST verification (`expectSavedCart`, `expectSavedOrder`,
  `expectOrderCount`, `expectStock`). Admin page objects come with
  `adminCommerceTest`.
- Use `graphql-network.ts`: start `waitForOperation` before the action, and fault-inject by operation name
  (`failOperation`, `expireTokenOnce`, `holdOperation`, `loseResponse`), never for the whole
  endpoint. Identity and refresh requests remain REST; only commerce REST
  requests count as a fallback.
- `adminCommerceTest` uses the shared administrator and may change only
  entities the test owns. Track products created through the UI with
  `shop.trackProductNamed` before asserting on them.
- Do not duplicate every UI
  test per transport; add GraphQL cases where the transport changes behavior.

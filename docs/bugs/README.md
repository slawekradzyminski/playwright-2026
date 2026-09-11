# API bug register

The individual reports contain reproduction evidence, expected behavior, impact, severity and retest criteria. Existing IDs are preserved. No finding is closed merely because the API suite passes.

| ID | Observed impact | Severity | Status |
|---|---|---|---|
| [BUG-01](%5BL%5D%5BFA%5D%20BUG-01%20-%20Sign-in%20request%20errors%20return%20401.md) | Request/protocol errors give misleading authentication guidance; related inventory overflow parsing behaves similarly. | Low | Open |
| [BUG-02](%5BL%5D%5BFA%5D%20BUG-02%20-%20Sign-in%20missing%20credentials%20bypass%20validation.md) | Missing credentials get generic rejection; the proposed validation policy is unagreed, with no bypass. | Low (provisional) | Needs clarification |
| [BUG-03](%5BL%5D%5BFA%5D%20BUG-03%20-%20Sign-in%20maximum-length%20error%20mentions%20minimum.md) | Maximum-length input gets minimum-length guidance. | Low | Open |
| [BUG-04](%5BM%5D%5BFA%5D%20BUG-04%20-%20Sign-up%20accepts%20empty%20email.md) | Historical empty-email acceptance creates invalid account data; current retest is blocked by an existing duplicate. | Medium | Open |
| [BUG-05](%5BL%5D%5BFA%5D%20BUG-05%20-%20Sign-up%20parsing%20errors%20return%20401.md) | Malformed registration input gets misleading authentication guidance. | Low | Open |
| [BUG-06](%5BM%5D%5BFA%5D%20BUG-06%20-%20Sign-up%20password%20limit%20contradicts%20contract.md) | Contract-valid passwords above 72 bytes cannot register. | Medium | Open |
| [BUG-07](%5BL%5D%5BFA%5D%20BUG-07%20-%20Sign-up%20maximum%20errors%20mention%20minimum.md) | Registration maximum-length errors describe minimum length. | Low | Open |
| [BUG-08](%5BL%5D%5BFA%5D%20BUG-08%20-%20Invalid%20order%20status%20returns%20unauthorized.md) | Invalid order status gets misleading authentication guidance. | Low | Open |
| [BUG-09](%5BL%5D%5BFA%5D%20BUG-09%20-%20Deleting%20a%20referenced%20product%20returns%20internal%20server%20error.md) | Referenced-product deletion fails with an opaque server error; the underlying deletion restriction may be legitimate. | Low | Open |
| [BUG-10](%5BL%5D%5BFA%5D%20BUG-10%20-%20Order%20reopening%20and%20backward%20transition%20policy%20is%20unclear.md) | Cancelled orders can reopen without reacquiring stock; intended transition policy is unresolved. | Low (provisional) | Needs clarification |
| [BUG-11](%5BM%5D%5BFA%5D%20BUG-11%20-%20QR%20codes%20silently%20replace%20Unicode%20characters.md) | Decoded QR content silently replaces Polish characters and emoji. | Medium | Open |
| [DOC-01](%5BL%5D%5BD%5D%20DOC-01%20-%20Swagger%20sign-in%20errors%20use%20success%20schema.md) | Login error consumers receive misleading success models; no outage demonstrated. | Low | Open |
| [DOC-02](%5BM%5D%5BD%5D%20DOC-02%20-%20Swagger%20sign-in%20schema%20rejects%20null%20challenge%20fields.md) | Normal login null challenge fields contradict declared string types. | Medium | Open |
| [DOC-03](%5BL%5D%5BD%5D%20DOC-03%20-%20Swagger%20sign-in%20contract%20omits%20401.md) | Conditional sign-in 401 is omitted from the contract. | Low | Open |
| [DOC-04](%5BL%5D%5BD%5D%20DOC-04%20-%20Swagger%20sign-up%20omits%20error%20response%20schemas.md) | Registration error bodies lack documented models. | Low | Open |
| [DOC-05](%5BL%5D%5BD%5D%20DOC-05%20-%20User%20GET%20errors%20use%20success%20schemas.md) | User GET errors use public-user success models. | Low | Open |
| [DOC-06](%5BL%5D%5BD%5D%20DOC-06%20-%20Prompt%20and%20refresh%20error%20schemas%20misdescribe%20responses.md) | User mutation, prompt and session error models misdescribe actual field/message errors. | Low | Open |
| [DOC-07](%5BM%5D%5BD%5D%20DOC-07%20-%20Prompt%20update%20returns%20undocumented%20null%20values.md) | Prompt reset and unknown-account recovery return null values excluded by successful-response types. | Medium | Open |
| [DOC-08](%5BL%5D%5BD%5D%20DOC-08%20-%20Product%20error%20schemas%20misdescribe%20responses.md) | Product error responses use success models. | Low | Open |
| [DOC-09](%5BM%5D%5BD%5D%20DOC-09%20-%20Product%20success%20schema%20excludes%20returned%20values.md) | Ordinary product responses violate nullable and timestamp types. | Medium | Open |
| [DOC-10](%5BL%5D%5BD%5D%20DOC-10%20-%20Product%20creation%20omits%20nonempty%20description%20constraint.md) | Empty product descriptions satisfy the schema but fail creation. | Low | Open |
| [DOC-11](%5BL%5D%5BD%5D%20DOC-11%20-%20Commerce%20errors%20omit%20stock%20conflicts%20and%20use%20success%20schemas.md) | Commerce stock conflicts and error bodies lack accurate models. | Low | Open |
| [DOC-12](%5BM%5D%5BD%5D%20DOC-12%20-%20Inventory%20response%20schemas%20and%20error%20branches%20are%20incomplete.md) | Routine inventory values violate success types; error and conflict branches are incomplete. | Medium | Open |
| [DOC-13](%5BL%5D%5BD%5D%20DOC-13%20-%20QR%20error%20responses%20are%20documented%20as%20PNG%20images.md) | QR errors are JSON although the contract advertises PNG. | Low | Open |
| [DOC-14](%5BL%5D%5BD%5D%20DOC-14%20-%20Traffic%20authentication%20session%20and%20error%20contracts%20are%20incomplete.md) | Traffic secured-profile setup and error/empty-body branches are incomplete. | Low | Open |

**Current register: 25 findings — 23 Open, 2 Needs clarification; 11 functional API, 14 documentation; 7 Medium, 18 Low (including two provisional Low).** No High impact or production security compromise has been demonstrated. The latest supervisor assessment distinguishes fresh reproductions, reviewed historical evidence and blocked prerequisites.

## How to maintain the register

1. Copy the [bug-report template](../exploratory-testing/bug-report-template.md) into this folder. Use the next unused `BUG-NN` for FA or `DOC-NN` for D; keep the ID stable. Name the file `[severity][category] ID - Short description.md`, for example `[L][FA] BUG-01 - Sign-in request errors return 401.md`. Keep filename prefixes aligned with severity/category changes and update links when renaming.
2. Start new report headings with `[FA/D]`, followed by the method, path, and observable problem. Present evidence and an impact assessment before assigning severity, following the [classification guide](../exploratory-testing/README.md#classify-findings). Add severity prefixes to filenames and register entries only after completing the assessment. When reassessing an existing report, move its severity decision below its impact assessment.
3. Add the report to the table above with observed impact before the separate severity and status columns. Update its status here and in the report together; keep the counts current.
4. Record fixes as **Fixed, awaiting retest**. Use **Verified** only after recording the retest date, build, and evidence. Keep closed reports for history.

The individual reports are the authoritative place for status and retest updates. Keep reproduction evidence in each bug report; separate per-endpoint exploration reports are not maintained. These are repository records; no GitHub issues have been published.

## Open questions requiring investigation

The September 10 sign-in session left four open questions: throttling was not observed in the bounded local run; numeric/boolean credentials reached authentication; duplicate username keys used the last value; GET/PUT on the sign-in path matched user routes. Effective rate-limit configuration, coercion policy, duplicate-key policy, and method-specific access rules still need investigation. These are not confirmed additional defects. Promote one to a report when its expected behavior and impact are established; use **Needs clarification** if a requirement is unresolved.

## Sign-up exploration scope and remaining questions

The 2026-09-10 session used a 20-minute timebox to investigate account creation, validation, contract consistency and role assignment. Covered: valid registration followed by login, duplicate username/email, missing/null/empty/whitespace/numeric values, independent minimum and maximum boundaries, malformed JSON and array bodies, invalid email syntax, admin-role injection, and the password byte boundary including Unicode. All successful exploratory fixtures were removed with verified 204 responses. Functional findings were reproduced before writing automation.

Whitespace-only username/password/names and numeric username/names were accepted. Their normalization, coercion and nonblank policies need clarification; these are not counted as confirmed defects. Concurrent duplicate creation, email case sensitivity, verification delivery, abuse/rate limiting, other HTTP media types/methods, and broader Unicode normalization were not tested. This session is not a release-readiness declaration.

## Supervisor reassessment — 2026-09-10

All 21 existing reports were reviewed; representative live reproductions and the unchanged live contract support the dispositions in each report. This was not a complete rerun of every historical boundary matrix or a fixed-build verification. The configured backend is `slawekradzyminski/backend:3.7.16`; local source may differ from the deployed revision. The full API suite passes independently of these unresolved findings.

BUG-02 and BUG-10 remain policy questions, not confirmed security/state-machine violations. BUG-04 could not be freshly reproduced because an existing account occupies the empty email; that does not prove a fix, and no unrelated account was changed to enable the test. BUG-01/05/08 share a symptom class, but a common root cause was not established. Do not add their severities together or infer an outage from their combined count.

The substantive new functional finding is BUG-11: native barcode decoding, repeated independently by the QR worker and supervisor, proves Unicode content loss despite a valid PNG. DOC-12/13/14 cover observed inventory, QR and traffic contract gaps. Existing DOC-06/07 were extended for related profile/password-recovery responses instead of creating duplicate findings for each field or status.

The proposed traffic page-size failure was rejected after an independent probe confirmed correct clamping. Inventory underflow/conflicting replay 409 responses protect stock and are covered as valid runtime behavior; missing Swagger entries are documentation defects. Numeric QR coercion, directory visibility, order reopening policy and untested production behavior remain questions, not confirmed additional bugs. Local reset-token exposure is an explicit training feature; it is not evidence of production token leakage or account-enumeration resistance.

## User GET exploration — 2026-09-10

Before automation, explored both GET routes through localhost:8081 with an administrator and a disposable, newly registered ROLE_CLIENT without MFA. Read the live operation/security declarations and UserResponseDto. Both authenticated roles received 200; `/me` matched the caller, and the list included the disposable account with the six documented public fields. Missing/empty credentials and a wrong authorization scheme returned 401 Unauthorized; malformed and modified-signature tokens returned 401 Invalid or expired token. Repeated the session and removed each disposable account with a verified 204 response. Local drivers and sanitized output remain in ignored `exploration/`.

A regular client could see other accounts' names and email addresses. The contract says “all user accounts visible to the authenticated caller” without defining visibility. Confirm whether this directory is intended for all clients before asserting any narrower access policy; no authorization bypass is claimed. The new list test checks its own account without assuming list size/order or codifying access to another account.

DOC-05 records the reproduced Swagger error mismatch. Expired tokens, disabled/deleted accounts with existing tokens, MFA, pagination/ordering guarantees, rate limiting, and build identity were not verified. Exploration does not establish release readiness.


## Prompt, username lookup and session exploration — 2026-09-10

Explored all seven requested operations before automation, then repeated the session. Used the live operation/request/response/security definitions, two disposable ROLE_CLIENT users without MFA, and the configured administrator for cleanup. Gateway: localhost:8081; deployed image/revision and effective rate-limit policy were not identified. Original snapshot remains intact. Local driver and sanitized results: ignored `exploration/remaining-users-session.mjs` and `remaining-users-results.txt`.

Both prompt defaults were nonempty strings. Unicode/multiline overrides persisted; 5000 ASCII characters succeeded and 5001 returned field validation errors. Empty strings reset the effective GET value to its default. Null and omitted fields returned null and also restored defaults; numeric input was coerced to a string. DOC-07 covers the successful-response null contradiction; numeric coercion policy remains an open question. Prompt errors and refresh errors use misleading Swagger models (DOC-06). Null/coercion branches are not automated as approved behavior.

Username lookup returned exact public fields for the caller and another disposable account, 404 for a UUID-based nonexistent username, and 401 without credentials. Its 401 success-schema mismatch extends DOC-05. Visibility of other accounts remains the existing policy question.

Refresh required no access token, returned exactly two token fields, rotated refresh credentials, rejected reuse, and accepted the replacement. Missing/null/empty/blank refresh tokens returned 400; unknown refresh tokens returned 401. Logout returned an empty 200, revoked refresh tokens from two sessions, left another account's refresh token usable, and accepted a repeated call. Existing access tokens remained usable after logout; the contract promises refresh-token revocation only. Every created exploratory user was deleted with a verified 204.

Uncovered: real expiry, concurrent refresh races, disabled accounts, MFA branches, malformed JSON/media-type matrices, and administrative-role variants. Cross-account prompt isolation was only sampled via default reads, not exhaustively proven. This is not a release-readiness assessment.


## Product exploration — 2026-09-10

Before automation, ran two bounded exploratory passes over all five operations using the live Swagger operations and linked schemas, a disposable ROLE_CLIENT without MFA, and the configured administrator. Gateway: localhost:8081. Build identity and rate-limit configuration were not verified. Drivers, live specification and sanitized results remain in ignored `exploration/products-*` files. No access tokens were recorded in results.

Both roles could read the created product and find it in the catalog. Only admin could create, update and delete. Client POST/PUT/DELETE returned 403 Access denied; subsequent reads confirmed no mutation. Missing and malformed tokens returned 401 on all five operations. Admin partial updates preserved unspecified fields and accepted price 0.01 and stock zero. Short/overlong names, overlong descriptions, zero price, negative stock and invalid image URL returned 400 field errors. Required-field creation errors, nonnumeric IDs, missing IDs and repeated deletion were explored. Every created product and disposable account was cleaned up with verified 204 responses.

DOC-08 and DOC-09 record reproduced contract defects. PUT accepts an empty category although POST rejects it; PUT with null name preserves the existing name. These differences need requirement clarification and are not automated as approved semantics. Uncovered: concurrency, orders referencing deleted products, decimal precision and overflow, real token expiry, MFA, rate limiting, exhaustive null/type/media matrices and timezone configuration. This is not a release-readiness claim.

Follow-up after a boundary test failed: repeated POST with an empty description twice, confirming 400 despite the declared minLength 0; PUT accepts it. DOC-10 records the discrepancy. The passing creation boundary test uses a nonempty description.


## Commerce exploration — 2026-09-10

Explored all five cart and six order operations before automation, using disposable client accounts and products plus admin credentials. Session scope: role boundaries, quantities and stock, checkout, order reads, cancellation/status and cleanup. Several bounded passes took approximately 10 minutes. Backend image: `slawekradzyminski/backend:3.7.16`; gateway localhost:8081. Source revision and effective rate-limit settings were not identified. The live commerce contract matches the retained September 10 snapshot; ignored `exploration/` contains local drivers, raw results and the live capture.

Clients manage their own carts, create orders and list their own orders. Only GET `/orders/admin` and PUT `/orders/{id}/status` require admin. Admin can read/cancel a client's order. Another client gets 404 for detail and 403 for cancellation. All 11 operations reject missing credentials; automated cases also cover malformed and tampered tokens. Cart quantities merge on POST and replace on PUT; zero PUT removes the item, zero POST and negative PUT fail with 400, absent items/products return 404, and stock overflow returns 409. Cart changes do not consume stock. Checkout rechecks stock, consumes it and clears the cart only on success; empty cart and invalid address fail with 400. Failed stock checkout retains the cart. Cancellation restores stock once; repeated cancellation and cancellation after shipping fail with 400. Pagination rejects negative page and zero size.

Cleanup order was investigated explicitly: product deletion before dependent order removal returned 500. All exploratory accounts and products were ultimately removed with 204, including the product retained by the failed deletion attempt. The isolated commerce fixture deletes account-owned orders before products and asserts cleanup responses.

Commerce findings are indexed in the central table above. Uncovered: simultaneous checkout/stock races, multi-product atomic rollback, full null/type/overflow/address matrices, price-change policy, real expiry/MFA, rate-limit quotas and the complete order transition matrix. Quantity and pagination limits here are business-input boundaries; API throttling policy remains untested. Inventory endpoint automation remains a separate plan item.

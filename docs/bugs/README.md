# API bug register

This is the central place to find and track API bugs discovered in this repository. Each finding has its own report with severity, environment, reproduction, actual/expected behavior, impact, and retest criteria.

**Current register:** 14 findings — 13 Open and 1 Needs clarification; 7 functional API and 7 documentation; 4 Medium and 10 Low (including one provisional Low). No High-severity impact is demonstrated in the recorded evidence. All findings were reassessed on 2026-09-10; original observations concern sign-in and sign-up on that date.

| ID | Finding title | Status |
|---|---|---|
| [BUG-01](%5BL%5D%5BFA%5D%20BUG-01%20-%20Sign-in%20request%20errors%20return%20401.md) | [L][FA] POST /api/v1/users/signin — Request/protocol errors are reported as unauthorized | Open |
| [BUG-02](%5BL%5D%5BFA%5D%20BUG-02%20-%20Sign-in%20missing%20credentials%20bypass%20validation.md) | [L][FA] POST /api/v1/users/signin — Required login credentials lack presence validation | Needs clarification |
| [BUG-03](%5BL%5D%5BFA%5D%20BUG-03%20-%20Sign-in%20maximum-length%20error%20mentions%20minimum.md) | [L][FA] POST /api/v1/users/signin — Maximum-length violations show a minimum-length error | Open |
| [BUG-04](%5BM%5D%5BFA%5D%20BUG-04%20-%20Sign-up%20accepts%20empty%20email.md) | [M][FA] POST /api/v1/users/signup — Empty email addresses create accounts | Open |
| [BUG-05](%5BL%5D%5BFA%5D%20BUG-05%20-%20Sign-up%20parsing%20errors%20return%20401.md) | [L][FA] POST /api/v1/users/signup — Malformed JSON is reported as unauthorized | Open |
| [BUG-06](%5BM%5D%5BFA%5D%20BUG-06%20-%20Sign-up%20password%20limit%20contradicts%20contract.md) | [M][FA] POST /api/v1/users/signup — Documented valid passwords fail above 72 bytes | Open |
| [BUG-07](%5BL%5D%5BFA%5D%20BUG-07%20-%20Sign-up%20maximum%20errors%20mention%20minimum.md) | [L][FA] POST /api/v1/users/signup — Maximum-length violations describe the minimum | Open |
| [DOC-01](%5BL%5D%5BD%5D%20DOC-01%20-%20Swagger%20sign-in%20errors%20use%20success%20schema.md) | [L][D] POST /api/v1/users/signin — Error responses are documented as successful login objects | Open |
| [DOC-02](%5BM%5D%5BD%5D%20DOC-02%20-%20Swagger%20sign-in%20schema%20rejects%20null%20challenge%20fields.md) | [M][D] POST /api/v1/users/signin — Successful response schema does not represent nullable fields correctly | Open |
| [DOC-03](%5BL%5D%5BD%5D%20DOC-03%20-%20Swagger%20sign-in%20contract%20omits%20401.md) | [L][D] POST /api/v1/users/signin — Invalid-Bearer failure is missing from the sign-in contract | Open |
| [DOC-04](%5BL%5D%5BD%5D%20DOC-04%20-%20Swagger%20sign-up%20omits%20error%20response%20schemas.md) | [L][D] POST /api/v1/users/signup — Validation response bodies have no documented schema | Open |
| [DOC-05](%5BL%5D%5BD%5D%20DOC-05%20-%20User%20GET%20errors%20use%20success%20schemas.md) | User GET error models mislead consumers; authentication remains enforced. Severity: Low. | Open |
| [DOC-06](%5BL%5D%5BD%5D%20DOC-06%20-%20Prompt%20and%20refresh%20error%20schemas%20misdescribe%20responses.md) | Prompt/refresh errors give consumers misleading models; rejection works. Severity: Low. | Open |
| [DOC-07](%5BM%5D%5BD%5D%20DOC-07%20-%20Prompt%20update%20returns%20undocumented%20null%20values.md) | Valid omitted-field requests produce success values incompatible with declared string types. Severity: Medium. | Open |


## How to maintain the register

1. Copy the [bug-report template](../exploratory-testing/bug-report-template.md) into this folder. Use the next unused `BUG-NN` for FA or `DOC-NN` for D; keep the ID stable. Name the file `[severity][category] ID - Short description.md`, for example `[L][FA] BUG-01 - Sign-in request errors return 401.md`. Keep filename prefixes aligned with severity/category changes and update links when renaming.
2. Start new report headings with `[FA/D]`, followed by the method, path, and observable problem. Present evidence and an impact assessment before assigning severity, following the [classification guide](../exploratory-testing/README.md#classify-findings). Add severity prefixes to filenames and register entries only after completing the assessment. When reassessing an existing report, move its severity decision below its impact assessment.
3. Add the report to the table above using its full title, including the severity and category prefixes. Update its status here and in the report together; keep the counts current.
4. Record fixes as **Fixed, awaiting retest**. Use **Verified** only after recording the retest date, build, and evidence. Keep closed reports for history.

The individual reports are the authoritative place for status and retest updates. Keep reproduction evidence in each bug report; separate per-endpoint exploration reports are not maintained. These are repository records; no GitHub issues have been published.

## Open questions requiring investigation

The September 10 sign-in session left four open questions: throttling was not observed in the bounded local run; numeric/boolean credentials reached authentication; duplicate username keys used the last value; GET/PUT on the sign-in path matched user routes. Effective rate-limit configuration, coercion policy, duplicate-key policy, and method-specific access rules still need investigation. These are not confirmed additional defects. Promote one to a report when its expected behavior and impact are established; use **Needs clarification** if a requirement is unresolved.

## Sign-up exploration scope and remaining questions

The 2026-09-10 session used a 20-minute timebox to investigate account creation, validation, contract consistency and role assignment. Covered: valid registration followed by login, duplicate username/email, missing/null/empty/whitespace/numeric values, independent minimum and maximum boundaries, malformed JSON and array bodies, invalid email syntax, admin-role injection, and the password byte boundary including Unicode. All successful exploratory fixtures were removed with verified 204 responses. Functional findings were reproduced before writing automation.

Whitespace-only username/password/names and numeric username/names were accepted. Their normalization, coercion and nonblank policies need clarification; these are not counted as confirmed defects. Concurrent duplicate creation, email case sensitivity, verification delivery, abuse/rate limiting, other HTTP media types/methods, and broader Unicode normalization were not tested. This session is not a release-readiness declaration.

## Reassessment — 2026-09-10

All 11 reports now present the impact assessment before the severity decision. The review uses existing evidence; it is not a new runtime test or confirmation of fixes. Claims about client outages, recovery loops and downstream security consequences have been qualified where they were not demonstrated.

Misleading rejection responses and incomplete error documentation currently show diagnostic or integration effort, without demonstrated material consumer failure. Consequently BUG-01, BUG-05, DOC-01 and DOC-04 move from Medium to Low. BUG-02 likewise moves to provisional Low and Needs clarification because the proposed missing-credential policy is not an agreed requirement.

Persisted invalid account data, rejection of contract-valid passwords, and a type contradiction on a normal successful response have stronger direct consequences. BUG-04, BUG-06 and DOC-02 therefore remain Medium. BUG-03, BUG-07 and DOC-03 remain Low because their demonstrated effects concern corrective guidance or an undocumented conditional failure with a workaround. Each report records its own limitations and reassessment triggers.


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

# API bug register

This is the central place to find and track API bugs discovered in this repository. Each finding has its own report with severity, environment, reproduction, actual/expected behavior, impact, and retest criteria.

**Current register:** 6 open findings — 3 functional API and 3 documentation; 4 Medium and 2 Low. No High-severity defect was confirmed in this session. All entries concern `POST /api/v1/users/signin`, observed on 2026-09-10.

| ID | Finding title | Status |
|---|---|---|
| [BUG-01](%5BM%5D%5BFA%5D%20BUG-01%20-%20Sign-in%20request%20errors%20return%20401.md) | [M][FA] POST /api/v1/users/signin — Request/protocol errors are reported as unauthorized | Open |
| [BUG-02](%5BM%5D%5BFA%5D%20BUG-02%20-%20Sign-in%20missing%20credentials%20bypass%20validation.md) | [M][FA] POST /api/v1/users/signin — Required login credentials lack presence validation | Open |
| [BUG-03](%5BL%5D%5BFA%5D%20BUG-03%20-%20Sign-in%20maximum-length%20error%20mentions%20minimum.md) | [L][FA] POST /api/v1/users/signin — Maximum-length violations show a minimum-length error | Open |
| [DOC-01](%5BM%5D%5BD%5D%20DOC-01%20-%20Swagger%20sign-in%20errors%20use%20success%20schema.md) | [M][D] POST /api/v1/users/signin — Error responses are documented as successful login objects | Open |
| [DOC-02](%5BM%5D%5BD%5D%20DOC-02%20-%20Swagger%20sign-in%20schema%20rejects%20null%20challenge%20fields.md) | [M][D] POST /api/v1/users/signin — Successful response schema does not represent nullable fields correctly | Open |
| [DOC-03](%5BL%5D%5BD%5D%20DOC-03%20-%20Swagger%20sign-in%20contract%20omits%20401.md) | [L][D] POST /api/v1/users/signin — Invalid-Bearer failure is missing from the sign-in contract | Open |

## How to maintain the register

1. Copy the [bug-report template](../exploratory-testing/bug-report-template.md) into this folder. Use the next unused `BUG-NN` for FA or `DOC-NN` for D; keep the ID stable. Name the file `[severity][category] ID - Short description.md`, for example `[M][FA] BUG-01 - Sign-in request errors return 401.md`. Keep filename prefixes aligned with severity/category changes and update links when renaming.
2. Start the title with `[H/M/L][FA/D]`, followed by the method, path, and observable problem. Explain severity using the [classification guide](../exploratory-testing/README.md#classify-findings).
3. Add the report to the table above using its full title, including the severity and category prefixes. Update its status here and in the report together; keep the counts current.
4. Record fixes as **Fixed, awaiting retest**. Use **Verified** only after recording the retest date, build, and evidence. Keep closed reports for history.

The individual reports are the authoritative place for status and retest updates. Keep reproduction evidence in each bug report; separate per-endpoint exploration reports are not maintained. These are repository records; no GitHub issues have been published.

## Open questions requiring investigation

The September 10 sign-in session left four open questions: throttling was not observed in the bounded local run; numeric/boolean credentials reached authentication; duplicate username keys used the last value; GET/PUT on the sign-in path matched user routes. Effective rate-limit configuration, coercion policy, duplicate-key policy, and method-specific access rules still need investigation. These are not confirmed additional defects. Promote one to a report when its expected behavior and impact are established; use **Needs clarification** if a requirement is unresolved.
